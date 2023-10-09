import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage,
WebSocketGateway, WebSocketServer,
MessageBody, ConnectedSocket} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io'
import { io } from 'socket.io-client';
import { IoAdapter } from '@nestjs/platform-socket.io';

class PlayerDTO {
  room : string;
  playerIdInRoom : number;
}

class GameServDTO {
  clientsNumber : number = 0;
  clientsId : string[] = [];
  rooms : string[] = [];
}

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

  playerDTO : Map<string, PlayerDTO> = new Map<string, PlayerDTO>;
  gameServDto : GameServDTO = new GameServDTO;
  
  @WebSocketServer()
  server : Server;

  /**
 * @description make the client join a room if there are some waiting for players,
 * otherwise create its own
 * also send to player if he is player 1 or 2
 */
  handleConnection(client: Socket) {
    this.gameServDto.clientsId.push(client.id)
    this.gameServDto.clientsNumber ++;
    this.playerDTO.set(client.id, new PlayerDTO);

    console.log('client id in connec: ' + client.id)
    if (this.server.sockets.adapter.rooms.size === 0)
    {
      let roomName = roomNameGenerator(10, this.server.sockets.adapter.rooms);
      this.gameServDto.rooms.push(roomName);
      this.playerDTO.get(client.id).playerIdInRoom = 1;
      this.playerDTO.get(client.id).room = roomName;
      client.join(roomName);
      client.emit('playerId', 1);
      console.log('1. room name: ', roomName)
      return;
    }

    let it = this.server.sockets.adapter.rooms;
    for (let i = 0; i < this.gameServDto.rooms.length ; i ++)
    {
      if (this.server.sockets.adapter.rooms.get(this.gameServDto.rooms[i]) &&
        this.server.sockets.adapter.rooms.get(this.gameServDto.rooms[i]).size < 2)
      {
        client.join(this.gameServDto.rooms[i]);
        this.playerDTO.get(client.id).playerIdInRoom = 1;
        this.playerDTO.get(client.id).room = this.gameServDto.rooms[i];
        client.emit('playerId', 2);
        console.log("2. room name: ", this.gameServDto.rooms[i], ' sockID: ' + client.id);
        return ;
      }
    }
    let roomName = roomNameGenerator(10, this.server.sockets.adapter.rooms);
    this.gameServDto.rooms.push(roomName);
    client.join(roomName);
    this.playerDTO.get(client.id).playerIdInRoom = 1;
    this.playerDTO.get(client.id).room = roomName;
    client.emit('playerId', 1);
    console.log('3. room name:', roomName)

  }

  handleDisconnect(client: Socket){
    this.gameServDto.clientsNumber --;
    client.rooms.forEach((value, key, map) => {console.log('disoc :', key); client.leave(key);})
  }

  @SubscribeMessage('playerMove')
  playerMove(@MessageBody() data : {x: number, y : number, playerId : number}, @ConnectedSocket() client: Socket) {
    if (client.rooms.size > 0) {
      this.server.to(this.playerDTO.get(client.id).room).emit('playerMove', data);
    }
  }

  @SubscribeMessage('ballMove')
  ballMove(@MessageBody() data : {x: number, y : number, playerId : number}, @ConnectedSocket() client: Socket) {
    if (client.rooms.size > 0) {
      this.server.to(this.playerDTO.get(client.id).room).emit('ballMove', data);
    }
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
