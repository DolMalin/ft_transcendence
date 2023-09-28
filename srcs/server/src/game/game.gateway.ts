import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage,
WebSocketGateway, WebSocketServer,
MessageBody, ConnectedSocket} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io'

@WebSocketGateway( {cors: {
    origin : '*'
  },
} )
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // @SubscribeMessage('message')
  // handleMessage(client: any, payload: any): string {
  //   return 'Hello world!';
  // }

  @WebSocketServer()
  server : Server;

  handleConnection(client: Socket) {
    console.log('feur')
  }
  handleDisconnect(client: Socket){
  
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    // Handle received message
    this.server.emit('message', data); // Broadcast the message to all connected clients
  }

  @SubscribeMessage('eventtt')
  eventtt(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log(data, client.id);
  }
}
