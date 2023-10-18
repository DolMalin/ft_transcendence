import { OnGatewayConnection,
OnGatewayDisconnect,
SubscribeMessage,
WebSocketGateway,
WebSocketServer,
MessageBody, 
ConnectedSocket} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io'
import { MatchmakingService } from './game.service';

// import { KeyboardEvent } from 'react'

let DOWN = 's';
let UP = 'w';
let LEFT = 'a';
let RIGHT = 'd';

export class GameServDTO {
  clientsNumber : number = 0;
  clientsId : string[] = [];
  rooms : {
    name : string
    clients : string[],
    gameType :string | string []
  }[] = [];
}

/**
 * @description generate string of lenght size, without ever recreating
 * one that is identical to one of the keys from the map passed as argument
 */



@WebSocketGateway( {cors: {
  // TO DO : remove dat shit
    origin : 'http://localhost:4343'
  },
} )
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

  gameServDto : GameServDTO = new GameServDTO;
  
  constructor(private readonly matchmakingService: MatchmakingService) {}
  
  @WebSocketServer()
  server : Server;
  /**
   * @description make the client join a room if there are some waiting for players,
   * otherwise create its own
   * also send to player if he is player 1 or 2
  */
 handleConnection(client: Socket) {
    this.gameServDto.clientsNumber ++;
    this.gameServDto.clientsId.push(client.id)

  console.log("IN HANDLE CO : " + client.rooms)
  }
  
  handleDisconnect(client: Socket){
    this.matchmakingService.leaveGame(this.server, client, this.gameServDto);
  }

  @SubscribeMessage('createGame')
  createGame(@MessageBody() data : string, @ConnectedSocket() client: Socket) {

    this.matchmakingService.gameCreation(this.server, client, this.gameServDto, data);
  }

  @SubscribeMessage('leaveGame')
  leaveGame(@MessageBody() data : undefined, @ConnectedSocket() client: Socket) {

    this.matchmakingService.leaveGame(this.server, client, this.gameServDto);
  }

  @SubscribeMessage('playerMove')
  playerMove(@MessageBody() data: string, @ConnectedSocket() client: Socket) {

    function test (x, y) {
      client.rooms.forEach((value, key, map) => {
          if (key !== client.id)
            client.to(key).emit('adversaryMoves', x, y)
        });
    }

    switch (data)
    {
      case UP :
        client.emit('myMoves', 0, -4);
        test(0, 4);
        break ;
      case DOWN :
        client.emit('myMoves', 0, 4);
        test(0, -4);
        break ;
      case RIGHT :
        client.emit('myMoves', 4, 0);
        test(-4, 0);
        break ;
      case LEFT :
        client.emit('myMoves', -4, 0);
        test(4, 0);
        break ;
      default :
        break;
    }
  }

  @SubscribeMessage('ballMove')
  ballMove(@MessageBody() data : {x: number, y : number, playerId : number}, @ConnectedSocket() client: Socket) {
  
  }
  
  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    // Handle received message
    this.server.emit('message', data); // Broadcast the message to all connected clients
  }

  @SubscribeMessage('eventtt')
  eventtt(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    // console.log(data, client.id);
    // console.log('ca passe par eeeventtt :' + client.id);
  }
}
