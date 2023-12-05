import { JwtService } from '@nestjs/jwt';
import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { AuthService } from 'src/auth/services/auth.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/services/users.service';
import { Message } from './entities/message.entity';
import { Room } from './entities/room.entity';

class ChatDTO {
  clientID: string[] = [];
}

@WebSocketGateway({ cors: true }) 
export class ChatGateway implements OnGatewayConnection,  OnGatewayDisconnect {
  constructor(
    private jwtService: JwtService,
    private readonly userService : UsersService,
    private readonly authService : AuthService
    ){}

  chatDTO: ChatDTO = new ChatDTO;
  @WebSocketServer()
  server : Server;

  async handleConnection (client: Socket) {
    // fetch tous les userId bloques : paul, 1 // jerem: 4 // max 6
    // for (const id of userBlocked){
      // join(#whoBlockedid) ==> contient tous les user qui ont bloques id
    // }
    try {
      const payload = await this.authService.validateAccessJwt(client.handshake.query.token as string);
    //  console.log(payload);
        this.userService.findOneById(client.handshake.query?.userId as string).then((user) => {

        this.userService.addChatSocketId(client.id, user.chatSockets, user);
      })
    }
    catch(e) {
      client.disconnect();
      console.log('handle connection ERROR : ', e);
    }

  }

  handleDisconnect(client: Socket) {
    try {
      this.userService.findOneById(client.handshake.query?.userId as string)?.then((user) => {

        this.userService.removeSocketId(client.id, user.chatSockets, user)
      })
    }
    catch(e) {
      console.log('handle connection ERROR : ', e);
    }
}

  @SubscribeMessage('message')
  message(@MessageBody() data: { message : string, targetId : string}, @ConnectedSocket() client : Socket): void {
    client.to(data.targetId).emit("DM", data.message);
  }
  
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
}