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
import { UsersService } from 'src/users/services/users.service';

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
  private readonly userService : UsersService
  ) {}
  
  @WebSocketServer()
  server : Server;

 handleConnection(client: Socket) {

    try {
      this.userService.findOneById(client.handshake.query.userId as string)?.then((user) => {

        this.userService.addSocketId(client.id, user.gameSockets, user);
      })
    }
    catch(e) {
      console.log('handle connection ERROR : ', e);
    }
  }
  
  handleDisconnect(client: Socket){

    //TO DO : REMOVE SOCKET FROM SOCKET [] in User on traditional disco
    try {
      this.userService.findOneById(client.handshake.query.userId as string)?.then((user) => {

        this.userService.removeSocketId(client.id, user.gameSockets, user)
      })
    }
    catch(e) {
      console.log('handle connection ERROR : ', e);
    }
    // this.userService
  }

  @SubscribeMessage('joinGame')
  joinGame(@MessageBody() data : {gameType : string, dbUserId : string},@ConnectedSocket() client: Socket) {

    this.matchmakingService.gameCreation(this.server, client, client.handshake.query.userId as string, this.gamesMap, data.gameType);
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
    try {
      this.userService.findOneById(client.handshake.query.userId as string)?.then((user) => {

        this.userService.update(user.id, {isAvailable : true});
        user.gameSockets.forEach((value) => {
          this.server.to(value).emit('isAvailable', true);
        })
      })
    }
    catch(e) {
      console.log('in availability change ERROR : ', e);
    }
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

  @SubscribeMessage('availabilityChange')
  availabilityChange(@MessageBody() bool : boolean, @ConnectedSocket() client: Socket) {
    
    try {
      this.userService.findOneById(client.handshake.query.userId as string)?.then((user) => {

        if (bool === true)
          this.userService.update(user.id, {isAvailable : bool});
        user.gameSockets.forEach((value) => {
          this.server.to(value).emit('isAvailable', bool);
        })
      })
    }
    catch(e) {
      console.log('in availability change ERROR : ', e);
    }
  }

  @SubscribeMessage('logout')
  logout(@ConnectedSocket() client: Socket) {
    
    this.availabilityChange(true, client);
    this.handleDisconnect(client);
    try {
        this.userService.findOneById(client.handshake.query.userId as string)?.then((user) => {

        user.gameSockets.forEach((value) => {
          this.server.to(value).emit('logout');
        })
      })
    }
    catch(e) {
      console.log('in availability change ERROR : ', e);
    }
  }

  @SubscribeMessage('ping')
  ping(@MessageBody() data : any, @ConnectedSocket() client: Socket) {
    console.log('PINGED DATA : ', data)
  }
}

