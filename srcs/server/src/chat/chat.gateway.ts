import { JwtService } from '@nestjs/jwt';
import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { User } from 'src/users/entities/user.entity';
import { Message } from './entities/message.entity';
import { Room } from './entities/room.entity';

class ChatDTO {
  clientID: string[] = [];
}

@WebSocketGateway({ cors: true }) 
export class ChatGateway implements OnGatewayConnection,  OnGatewayDisconnect {
  constructor(private jwtService: JwtService){}

  chatDTO: ChatDTO = new ChatDTO;
  @WebSocketServer()
  server : Server;

  handleConnection (client: any) {
    // fetch tous les userId bloques : paul, 1 // jerem: 4 // max 6
    // for (const id of userBlocked){
      // join(#whoBlockedid) ==> contient tous les user qui ont bloques id
    // }
    if (client.handshake.headers.authorization) {
      const token = client.handshake.headers.authorization.split(' ');
      if (token.length == 2) {
        //TODO not decode but verify
        const payload = this.jwtService.decode(token[1]) as {id: string};
        console.log(" payload", payload?.id)
        client.userId = payload?.id;
      }
    }
    // TODO else disconnect
    
    console.log("Connection of socket ID : " + client.id);
    this.chatDTO.clientID.push(client.id);
    this.server.emit("clientList", this.chatDTO.clientID);
  }

  handleDisconnect(client: any) {
  console.log("Disonnection of socket ID : " + client.id);
  this.chatDTO.clientID = this.chatDTO.clientID.filter(id => id != client.id);
  this.server.emit("clientList", this.chatDTO.clientID);
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