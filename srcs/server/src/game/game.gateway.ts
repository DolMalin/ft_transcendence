import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io'

@WebSocketGateway()
export class GameGateway {
  // @SubscribeMessage('message')
  // handleMessage(client: any, payload: any): string {
  //   return 'Hello world!';
  // }

  @WebSocketServer()
  server : Server;

  handleConnection(client: Socket) {

  }
  handleDisconnect(client: Socket){

  }
}
