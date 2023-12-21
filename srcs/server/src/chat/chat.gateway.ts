import { ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { AuthService } from 'src/auth/services/auth.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/services/users.service';
import { Message } from './entities/message.entity';
import { RoomService } from './services/room.service';
import { UpdatePrivilegesDto } from './dto/update-privileges.dto';

class ChatDTO {
  clientID: string[] = [];
}

@WebSocketGateway({ cors: true }) 
export class ChatGateway implements OnGatewayConnection,  OnGatewayDisconnect {
  constructor(
    private readonly userService : UsersService,
    private readonly authService : AuthService,
    private readonly roomService : RoomService
    ){}

  chatDTO: ChatDTO = new ChatDTO;
  @WebSocketServer()
  server : Server;

  async handleConnection (client: Socket) {
    Logger.log("Connection of socket ID : " + client.id);
    this.chatDTO.clientID.push(client.id);
    try 
    {
        if (client.handshake.query.type !== 'chat')
          return ;
        if (client.handshake.query?.userId as string === undefined)
        {
            client.disconnect();
            return ;
        }
        const payload = await this.authService.validateAccessJwt(client.handshake.query.token as string);
        client.join(`user-${payload.id}`)
        Logger.log(`client ${client.id} joined user ${payload.id}`)
    }
    catch(err) {
        client.disconnect();
        Logger.error(`${err.response.data.message} (${err.response.data.error})`)
    }
  }

  async handleDisconnect(client: Socket) {  
    Logger.log("Disonnection of socket ID : " + client.id);
    this.chatDTO.clientID = this.chatDTO.clientID.filter(id => id != client.id);
  }
  
  @SubscribeMessage('joinRoom')
  joinRoom(@MessageBody() roomId: number, @ConnectedSocket() client : Socket): void {
    client.join(`room-${roomId}`)
    this.server.to(`room-${roomId}`).emit('userJoined');
    Logger.log(`User with ID: ${client.id} joined room ${roomId}`)
  
  }
  
  @SubscribeMessage('sendMessage')
  async sendMessage(@MessageBody() data: Message, @ConnectedSocket() client : Socket) {
    const room = await this.roomService.findOneByIdWithRelations(data.room.id)
    const sender = await this.userService.findOneById(client.handshake.query?.userId as string)
    room.users.forEach((user) => {
      const isBlocked = user.blocked?.some((userToFind: User) => userToFind.id === sender.id);
      Logger.log(`User ${user.id} is blocked: ${isBlocked}`);
      if (!isBlocked) {
        client.to(`user-${user.id}`).emit("receiveMessage", data);
      }
    });
  }

  @SubscribeMessage('unblock')
  async unblock(@MessageBody() data: {targetId: string}, @ConnectedSocket() client: Socket){
    if (!data || typeof data.targetId !== "string"){
      Logger.error("Wrong type for parameter")
      return 
    }
    const res = await this.userService.unblockTarget(client.handshake.query?.userId as string, data.targetId)
    this.server.to(`user-${res.user.id}`).emit("unblocked", {username: res.user.username, username2: res.user2.username})
    this.server.to(`user-${res.user2.id}`).emit("unblocked2", {username: res.user.username, username2: res.user2.username})
  }

  @SubscribeMessage('DM')
  async directMessage(@MessageBody() data: { targetId: string }, @ConnectedSocket() client: Socket) {
      if (!data || typeof data.targetId !== "string") {
          Logger.error("Wrong type for parameter")
          return;
      }

      try {
          const user = await this.userService.findOneByIdWithBlockRelation(client.handshake.query?.userId as string)
          const user2 = await this.userService.findOneByIdWithBlockRelation(data.targetId)
          await this.createOrJoinDMRoom(user, user2, this.server, client)
      } catch (err) {
        // throw new NotFoundException("User not found", {cause: new Error(), description: "user not found"})
      }
  }


  async createOrJoinDMRoom(user: User, user2: User, server: Server, client: Socket) {
    const roomName = this.generateDMRoomName(user.id, user2.id)
    let room = await this.roomService.getRoom(roomName)
    if (this.userService.isAlreadyBlocked(user, user2) || this.userService.isAlreadyBlocked(user2, user)){
      server.to(`user-${user.id}`).emit("userBlocked", 
      {
        title: 'You cannot direct message this user',
        desc: 'You cannot send or receive direct message from someone you have blocked or have been blocked by'
      })
      return
    }
    if (!room) {
      room = await this.roomService.createDM(user, user2, roomName)
    }
    server.to(`user-${user.id}`).to(`user-${user2.id}`).emit("dmRoom", room)
}

  generateDMRoomName(user1Id: string, user2Id: string): string {
      return user1Id < user2Id ? `${user1Id}-${user2Id}` : `${user2Id}-${user1Id}`
  }
  
  @SubscribeMessage('block')
  async blockTarget(@MessageBody() data: { targetId: string }, @ConnectedSocket() client: Socket){
    try {
      this.userService.blockTarget(client.handshake.query?.userId as string, data.targetId)
    } 
    catch (err) {
      // throw new NotFoundException("User not found", {cause: new Error(), description: "user not found"})
    } 
  }

  @SubscribeMessage('friendRequestSended')
  async friendRequestSended(@MessageBody() data: {creatorId: string}, @ConnectedSocket() client: Socket) {
    if (!data || typeof data.creatorId !== 'string')
      return
    this.server.to('user-' + data.creatorId).emit('friendRequestSendedModal', data)
    this.server.to('user-' + data.creatorId).emit('friendRequestSendedChat')

  }


  @SubscribeMessage('friendRequestAccepted')
  async friendRequestAccepted(@MessageBody() data: {creatorId: string}, @ConnectedSocket() client: Socket) {
    if (!data || typeof data.creatorId !== 'string')
      return
    
    this.server.to('user-' + data.creatorId).emit('friendRequestAcceptedModal', data)
    this.server.to('user-' + data.creatorId).emit('friendRequestAcceptedChat')
  }

  @SubscribeMessage('friendRemoved')
  async friendRemoved(@MessageBody() data: {creatorId: string}, @ConnectedSocket() client: Socket) {
    if (!data || typeof data.creatorId !== 'string')
      return
    
    
    this.server.to('user-' + data.creatorId).emit('friendRemovedModal', data)
    this.server.to('user-' + data.creatorId).emit('friendRemovedChat')
  }
  
  @SubscribeMessage('channelRightsUpdate')
  channelRightsUpdate(@MessageBody() data : {roomId : number} , @ConnectedSocket() client : Socket) {

    if (!data || typeof data.roomId !== 'number')
    {
      Logger.error('wrong data passd to channelRightsUpdate event');
      return ;
    }
      this.server.to(`room-${data.roomId}`).emit('channelUpdate');
  }

  @SubscribeMessage('userGotBanned')
  userGotBanned(@MessageBody() data : {targetId : string} , @ConnectedSocket() client : Socket) {

    if (!data || typeof data.targetId !== 'string')
    {
      Logger.error('wrong data passd to userGotBanned event');
      return ;
    }
      this.server.to(`user-${data.targetId}`).emit('youGotBanned');
  }


}
