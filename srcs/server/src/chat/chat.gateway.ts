import { Logger, NotFoundException } from '@nestjs/common';
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
    //TODO maybe find another way
    // fetch tous les userId bloques : paul, 1 // jerem: 4 // max 6
    // for (const id of userBlocked){
        // join(#whoBlockedid) ==> contient tous les user qui ont bloques id
        
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
    Logger.log(`User with ID: ${client.id} joined room ${roomId}`)
  
  }
  
  @SubscribeMessage('sendMessage')
  sendMessage(@MessageBody() data: Message, @ConnectedSocket() client : Socket): void {
    client.to(`room-${data.room.id}`).emit("receiveMessage", data)
    // client.to(data.room.name)/*{.except(#whoBlocked senderId)}*/.emit("receiveMessage", data);
  }

  @SubscribeMessage('DM')
  async directMessage(@MessageBody() data: { targetId: string }, @ConnectedSocket() client: Socket) {
      if (!data || typeof data.targetId !== "string") {
          Logger.error("Wrong type for parameter");
          return;
      }

      try {
          const user = await this.userService.findOneById(client.handshake.query?.userId as string);
          const user2 = await this.userService.findOneById(data.targetId)
          await this.createOrJoinDMRoom(user, user2, this.server);

      } catch (err) {
        // throw new NotFoundException("User not found", {cause: new Error(), description: "user not found"})
      }
  }


  async createOrJoinDMRoom(user: User, user2: User, server: Server) {
    const roomName = this.generateDMRoomName(user.id, user2.id)
    let room = await this.roomService.getRoom(roomName)
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
      const user = await this.userService.findOneById(client.handshake.query?.userId as string);
      const user2 = await this.userService.findOneById(data.targetId)
      this.userService.blockTarget(user, user2)
    } 
    catch (err) {
      // throw new NotFoundException("User not found", {cause: new Error(), description: "user not found"})
    } 
  }

  @SubscribeMessage('channelRightsUpdate')
  channelRightsUpdate(@MessageBody() data : UpdatePrivilegesDto , @ConnectedSocket() client : Socket) {
    client.rooms.forEach((value) => Logger.debug('room : ' + value))


      console.log(data.roomId)
      this.server.to(`room-${data.roomId}`).emit('channelUpdate');
  }
}
