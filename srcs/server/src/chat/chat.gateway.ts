import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection,  OnGatewayDisconnect {

handleConnection (client : any) {
  console.log('feur');
}

handleDisconnect(client: any) {
    console.log('adios')
}

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
