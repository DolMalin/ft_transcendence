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
  }

  handleDisconnect(client: any) {
  console.log("Disonnection of socket ID : " + client.id);
  this.chatDTO.clientID = this.chatDTO.clientID.filter(id => id != client.id);
  }

  @SubscribeMessage('message')
  message(@MessageBody() data: { message : string, targetId : string}, @ConnectedSocket() client : Socket): void {
    client.to(data.targetId).emit("DM", data.message);
  }

  @SubscribeMessage('getClients')
  getClients(@ConnectedSocket() client : Socket): void {
    client.emit("clientList", this.chatDTO.clientID);
  }
}
