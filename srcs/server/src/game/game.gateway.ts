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
import {
  Game,
  GameInfo,
} from './interfaces'
import { clearInterval } from 'timers';

// import { KeyboardEvent } from 'react'

// export class GameServDTO {
//   clientsId : string[] = [];
//   rooms : {
//     name : string
//     clients : string[],
//     gameType :string | string [],
//   }[] = [];
// }


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

  }
  
  handleDisconnect(client: Socket){

  }

  @SubscribeMessage('joinGame')
  joinGame(@MessageBody() gameType : string, @ConnectedSocket() client: Socket) {

    this.matchmakingService.gameCreation(this.server, client, this.gamesMap, gameType);
  }

  @SubscribeMessage('leaveGame')
  leaveGame(@MessageBody() data : GameInfo, @ConnectedSocket() client: Socket) {

    clearInterval(this.gamesMap.get(data.roomName)?.ballRefreshInterval);
    client.leave(data.roomName);
    this.matchmakingService.leaveGame(this.server, client, this.gamesMap, data);
  }

  @SubscribeMessage('leaveQueue')
  leaveQueue(@MessageBody() roomName : string, @ConnectedSocket() client: Socket) {

    this.gamesMap.delete(roomName);
    client.leave(roomName);
  }

  @SubscribeMessage('playerMove')
  playerMove(@MessageBody() data: {key : string, playerId : string, room : string}, @ConnectedSocket() client: Socket) {
    
    this.gamePlayService.movingStarted(this.gamesMap.get(data.room), data)
  }

  @SubscribeMessage('playerMoveStopped')
  playerMoveStopped(@MessageBody() data: {key : string, playerId : string, room : string}, @ConnectedSocket() client: Socket) {
    
    this.gamePlayService.movingStopped(this.gamesMap.get(data.room), data)
  }

  @SubscribeMessage('startGameLoop')
  startGameLoop(@MessageBody() data : GameInfo, @ConnectedSocket() client: Socket) {
    const game = this.gamesMap.get(data.roomName);
    if (game === undefined)
      return ; // TO DO : emit something saying game crashed
    
    this.gamePlayService.gameLoop(this.gamesMap, this.gamesMap.get(data.roomName), data, client, this.server);
  }
  @SubscribeMessage('ping')
  ping(@ConnectedSocket() client: Socket) {
    console.log('PING PING PING PING PING PING')
  }
}

