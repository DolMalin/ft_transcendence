import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { AuthService } from 'src/auth/services/auth.service';
import { UsersService } from 'src/users/services/users.service';
import { Message } from './entities/message.entity';
import { RoomService } from './services/room.service';

class ChatDTO {
  clientID: string[] = [];
}

@WebSocketGateway({ cors: true }) 
export class ChatGateway implements OnGatewayConnection,  OnGatewayDisconnect {
  constructor(
    private jwtService: JwtService,
    private readonly userService : UsersService,
    private readonly authService : AuthService,
    private readonly roomService : RoomService
    ){}

  chatDTO: ChatDTO = new ChatDTO;
  @WebSocketServer()
  server : Server;

  async handleConnection (client: Socket) {
    //TODO maybe find another way
    console.log("Connection of socket ID : " + client.id);
    this.chatDTO.clientID.push(client.id);
    // fetch tous les userId bloques : paul, 1 // jerem: 4 // max 6
    // for (const id of userBlocked){
    // join(#whoBlockedid) ==> contient tous les user qui ont bloques id

    try {
      const payload = await this.authService.validateAccessJwt(client.handshake.query.token as string);
      if (client.handshake.query.type !== 'chat')
        return ;
      const user = await  this.userService.findOneById(client.handshake.query?.userId as string);
      await this.userService.addChatSocketId(client.id, user.chatSockets, user);
    }
    catch(e) {
      client.disconnect();
      console.log('handle connection ERROR : ', e);
    }

  }


async handleDisconnect(client: Socket) {
      //TODO maybe find another way
      console.log("Disonnection of socket ID : " + client.id);
    this.chatDTO.clientID = this.chatDTO.clientID.filter(id => id != client.id);
    try {
      if (client.handshake.query.type !== 'chat')
        return ;
      const user = await  this.userService.findOneById(client.handshake.query?.userId as string);
      await this.userService.addChatSocketId(client.id, user.chatSockets, user);
    }
    catch(e) {
      console.log('handle connection ERROR : ', e);
    }
  }


  // @SubscribeMessage('message')
  // message(@MessageBody() data: { message : string, targetId : string}, @ConnectedSocket() client : Socket): void {
  //   client.to(data.targetId).emit("DM", data.message);
  // }
  
  @SubscribeMessage('joinRoom')
  joinRoom(@MessageBody() roomId: number, @ConnectedSocket() client : Socket): void {
    client.join(`room-${roomId}`)
    console.log(`User with ID: ${client.id} joined room ${roomId}`)
  
  }
  
  @SubscribeMessage('sendMessage')
  sendMessage(@MessageBody() data: Message, @ConnectedSocket() client : Socket): void {
    //findbyID ou
    client.to(`room-${data.room.id}`).emit("receiveMessage", data)
    // client.to(data.room.name)/*{.except(#whoBlocked senderId)}*/.emit("receiveMessage", data);
  }


  @SubscribeMessage('DM')
  async directMessage(@MessageBody() data : {targetId : string}, @ConnectedSocket() client : Socket){
    console.log('test from back')
    if (!data || data === undefined || typeof data.targetId != "string"){
      console.error("wrong type for parameter")
      return 
    }
    try{
      const user = await this.userService.findOneById(client.handshake.query?.userId as string);
      this.roomService.createDM(this.server, user, data.targetId)
    }
    catch(err){
      throw new NotFoundException("User not found", {cause: new Error(), description: "user not found"})
    }
  }
}