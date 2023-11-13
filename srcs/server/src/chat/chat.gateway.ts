import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

class ChatDTO {
  clientID: string[] = [];
}

@WebSocketGateway({ cors: true }) 
export class ChatGateway implements OnGatewayConnection,  OnGatewayDisconnect {

  chatDTO: ChatDTO = new ChatDTO;

  @WebSocketServer()
  server : Server;

  // private server : Server;

  // afterInit(server: Server){
  //   this.server = server;
  // }

  handleConnection (client : any) {
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
  joinRoom(@MessageBody() room, @ConnectedSocket() client : Socket): void {
    client.join(room)
    console.log(`User with ID: ${client.id} joined room ${room}`)
  }  
  
  @SubscribeMessage('sendMessage')
  sendMessage(@MessageBody() data: { room: string, author: string, message: string, time: string | number}, @ConnectedSocket() client : Socket): void {
    client.to(data.room).emit("receiveMessage", data);
    console.log("hello from send message")
    console.log(data)
  }
}

