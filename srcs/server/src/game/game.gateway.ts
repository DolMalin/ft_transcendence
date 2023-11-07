import { OnGatewayConnection,
OnGatewayDisconnect,
SubscribeMessage,
WebSocketGateway,
WebSocketServer,
MessageBody, 
ConnectedSocket} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io'
import { MatchmakingService,
GamePlayService } from './game.service';
import * as Constants from './const'
import {
  Game,
  GameInfo,
} from './interfaces'
import { clearInterval } from 'timers';

// import { KeyboardEvent } from 'react'

export class GameServDTO {
  clientsNumber : number = 0;
  clientsId : string[] = [];
  rooms : {
    name : string
    clients : string[],
    gameType :string | string [],
  }[] = [];
}


/**
 * @description generate string of lenght size, without ever recreating
 * one that is identical to one of the keys from the map passed as argument
 */



@WebSocketGateway( {cors: {
  // TO DO : remove dat shit
    origin : process.env.CLIENT_URL
  },
} )
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

  gameServDto : GameServDTO = new GameServDTO;
  gamesMap : Map<string, Game> = new Map();
  
  constructor(private readonly matchmakingService: MatchmakingService,
  private readonly gamePlayService : GamePlayService) {}
  
  @WebSocketServer()
  server : Server;
  /**
   * @description make the client join a room if there are some waiting for players,
   * otherwise create its own
   * also send to player if he is player 1 or 2
  */
 handleConnection(client: Socket) {

    this.gameServDto.clientsNumber ++;
    this.gameServDto.clientsId.push(client.id);
  }
  
  handleDisconnect(client: Socket){

    this.matchmakingService.leaveGame(this.server, client, this.gameServDto, this.gamesMap);
  }

  @SubscribeMessage('joinGame')
  joinGame(@MessageBody() gameType : string, @ConnectedSocket() client: Socket) {

    this.matchmakingService.gameCreation(this.server, client, this.gameServDto, gameType);
  }

  @SubscribeMessage('gameStart')
  gameStart(@MessageBody() data : GameInfo, @ConnectedSocket() client : Socket) {

    this.matchmakingService.launchGame(this.server, this.gamesMap, client, data);
  }

  @SubscribeMessage('leaveGame')
  leaveGame(@MessageBody() gameRoom : string, @ConnectedSocket() client: Socket) {

    clearInterval(this.gamesMap.get(gameRoom)?.ballRefreshInterval);
    this.matchmakingService.leaveGame(this.server, client, this.gameServDto, this.gamesMap);
  }

  @SubscribeMessage('playerMove')
  playerMove(@MessageBody() data: {key : string, playerId : string, room : string}, @ConnectedSocket() client: Socket) {
    
    // const game = this.gamesMap.get(data.room);

    this.gamePlayService.handlePaddleMovement(this.gamesMap.get(data.room), data, client)
  }

  @SubscribeMessage('ballMove')
  ballMove(@MessageBody() data : GameInfo, @ConnectedSocket() client: Socket) {
    const game = this.gamesMap.get(data.roomName);
    if (game === undefined)
      return ; // TO DO : emit something saying game crashed
    
    this.server.to(data.roomName).emit('ballInfos', game.ball);
    

    this.gamePlayService.handleBallMovement(this.gamesMap.get(data.roomName), data, client, this.server);
  }
}