import { OnGatewayConnection,
OnGatewayDisconnect,
SubscribeMessage,
WebSocketGateway,
WebSocketServer,
MessageBody, 
ConnectedSocket} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io'
import { MatchmakingService,
GamePlayService } from '../services/game.services';
import {
  GameState,
  GameInfo,
} from '../globals/interfaces'
import { clearInterval } from 'timers';
import { GetUser } from 'src/users/decorator/user.decorator';
import { User } from 'src/users/entities/user.entity';

@WebSocketGateway( {cors: {
  // TO DO : remove dat shit
    origin : '*'
  },
} )
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

  gamesMap : Map<string, GameState> = new Map();
  
  constructor(private readonly matchmakingService: MatchmakingService,
  private readonly gamePlayService : GamePlayService) {}
  
  @WebSocketServer()
  server : Server;

 handleConnection(client: Socket) {

  }
  
  handleDisconnect(client: Socket){

  }

  @SubscribeMessage('joinGame')
  joinGame(@MessageBody() data : {gameType : string, dbUserId : string},@ConnectedSocket() client: Socket) {

    this.matchmakingService.gameCreation(this.server, client, data.dbUserId, this.gamesMap, data.gameType);
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
  ping(@MessageBody() data : any, @ConnectedSocket() client: Socket) {
    console.log('PINGED DATA : ', data)
  }
}

