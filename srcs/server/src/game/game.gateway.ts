import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage,
WebSocketGateway, WebSocketServer,
MessageBody, ConnectedSocket} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io'
import { io } from 'socket.io-client';
import { IoAdapter } from '@nestjs/platform-socket.io';

/**
 * @description generate string of lenght size, without ever recreating
 * one that is identical to one of the keys from the map passed as argument
 */

function roomNameGenerator(lenght : number, map : Map<string, Set<string>>)
{
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let str = '';
  const charactersLength = characters.length;
    for (let i = 0; i < lenght; i ++)
    {
      str += characters.charAt(Math.floor(Math.random() * charactersLength));
      if (i === lenght - 1 && map.has(str))
      {
        str = '';
        i = 0;
      }
    }
      return (str);
}

@WebSocketGateway( {cors: {
    origin : '*'
  },
} )
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // @SubscribeMessage('message')
  // handleMessage(client: any, payload: any): string {
  //   return 'Hello world!';
  // }
  players : string[] = [];
  roomNames : string[] = [];

  @WebSocketServer()
  server : Server;

  handleConnection(client: Socket) {
    this.players.push(client.id);
    console.log(client.id);
    if (this.server.sockets.adapter.rooms.size === 0)
    {
      let roomName = roomNameGenerator(10, this.server.sockets.adapter.rooms);
      this.roomNames.push(roomName);
      client.join(roomName);
      this.roomNames.forEach((value, i, array) => (console.log("room name : ", value)));
      return;
    }

    let it = this.server.sockets.adapter.rooms;
    for (let i = 0; i < this.roomNames.length ; i ++)
    {
      if (this.server.sockets.adapter.rooms.get(this.roomNames[i]).size && this.server.sockets.adapter.rooms.get(this.roomNames[i]).size < 2)
      {
        client.join(this.roomNames[i]);
      this.roomNames.forEach((value, i, array) => (console.log("room name : ", value)));
        return ;
      }
    }
    let roomName = roomNameGenerator(10, this.server.sockets.adapter.rooms);
    this.roomNames.push(roomName);
    client.join(roomName);
    this.roomNames.forEach((value, i, array) => (console.log("room name : ", value)));

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
    // console.log(data, client.id);
  }
}
