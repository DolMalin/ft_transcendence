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
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

@WebSocketGateway( {cors: {
  // TO DO : remove dat shit
    origin : '*'
  },
} )
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

  gamesMap : Map<string, GameState> = new Map();
  
  constructor(
  private readonly matchmakingService: MatchmakingService,
  private readonly gamePlayService : GamePlayService,
  private readonly jwtService : JwtService
  ) {}
  
  @WebSocketServer()
  server : Server;

 handleConnection(client: Socket) {
      // fetch tous les userId bloques : paul, 1 // jerem: 4 // max 6
    // for (const id of userBlocked){
      // join(#whoBlockedid) ==> contient tous les user qui ont bloques id
    // }

    if (client.handshake.headers.authorization) {
      const token = client.handshake.headers.authorization.split(' ');
      if (token.length == 2) {
        //TODO not decode but verify
        console.log('token : ', token[1])
        const payload = this.jwtService.decode(token[1]) as {id: string};
        console.log('pay load : ', payload);
      }
      console.log("Connection of socket ID : " + client.id);
    }
    else {
      client.disconnect();
      console.log("client disconnected, wrong token : " + client.id);
      
    }
    // TODO else disconnect
    
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

