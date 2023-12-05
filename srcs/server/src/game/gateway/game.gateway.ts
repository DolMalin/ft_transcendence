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
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/services/users.service';
import { type } from 'os';
import { AuthService } from 'src/auth/services/auth.service';
import { IsJWT } from 'class-validator';
import { subscribe } from 'superagent';

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
    private readonly userService : UsersService,
    private readonly authService : AuthService
  ) {}
  
  @WebSocketServer()
  server : Server;

 async handleConnection(client: Socket) {

   try {
      const payload = await this.authService.validateAccessJwt(client.handshake.query.token as string);
    //  console.log(payload);
      this.userService.findOneById(client.handshake.query?.userId as string).then((user) => {

        this.userService.addSocketId(client.id, user.gameSockets, user);
      })
    }
    catch(e) {
      client.disconnect();
      console.log('handle connection ERROR : ', e);
    }
  }
  
  handleDisconnect(client: Socket){

    try {
      this.userService.findOneById(client.handshake.query?.userId as string)?.then((user) => {

        this.userService.removeSocketId(client.id, user.gameSockets, user)
      })
    }
    catch(e) {
      console.log('handle connection ERROR : ', e);
    }
  }

  @SubscribeMessage('joinGame')
  joinGame(@MessageBody() data : {gameType : string},@ConnectedSocket() client: Socket) {

    if (client.handshake.query.userId === undefined) {
      console.log('failed auth in joinGame', typeof data?.gameType)
      return ;
    }
    if (typeof data?.gameType !== 'string')
    {
      console.log('wrong data type in joinGame : ', typeof data?.gameType)
      return ;
    }

    this.matchmakingService.gameCreation(this.server, client, client.handshake.query?.userId as string, this.gamesMap, data.gameType);
  }

  @SubscribeMessage('leaveGame') // Protected against socket meddling
  leaveGame(@MessageBody() data : GameInfo, @ConnectedSocket() client: Socket) {

    // console.log ('data in leave : ', data)
    if (typeof data?.gameType !== 'string' || typeof data?.playerId !== 'string' || typeof data?.roomName !== 'string')
    {
      console.log('wrong type in leaveGame')
      return ;
    }
     
    // clearInterval(this.gamesMap.get(data.roomName)?.ballRefreshInterval);
    // client.leave(data.roomName);
    this.matchmakingService.leaveGame(this.server, client, this.gamesMap, data);
  }

  @SubscribeMessage('leaveQueue') // Protected against socket meddling
  leaveQueue(@MessageBody() data : {roomName : string}, @ConnectedSocket() client: Socket) {

    if (data === null || data === undefined || typeof data?.roomName !== 'string')
    {
      console.log('wrong type in leaveQueue', data.roomName)
      return ;
    }

    this.matchmakingService.leaveQueue(data, this.gamesMap, client, this.server);
  }

  @SubscribeMessage('playerMove') // Protected against socket meddling
  playerMove(@MessageBody() data: {key : string, playerId : string, room : string}, @ConnectedSocket() client: Socket) {
    
    if (typeof data?.key !== 'string' || typeof data?.playerId !== 'string' || typeof data?.room !== 'string' )
    {
      console.log('wrong type in move', typeof data?.key, typeof data?.playerId, typeof data?.room)
      return ;
    }

    this.gamePlayService.movingStarted(this.gamesMap.get(data.room), data, client.id)
  }

  @SubscribeMessage('playerMoveStopped') // Protected against socket meddling
  playerMoveStopped(@MessageBody() data: {key : string, playerId : string, room : string}, @ConnectedSocket() client: Socket) {
    
    if (typeof data.key !== 'string' || typeof data.playerId !== 'string' || typeof data.room !== 'string' )
      return ;

    this.gamePlayService.movingStopped(this.gamesMap.get(data.room), data, client.id)
  }

  @SubscribeMessage('startGameLoop') // Protected against socket meddling
  startGameLoop(@MessageBody() data : GameInfo, @ConnectedSocket() client: Socket) {

    if (typeof data?.gameType !== 'string' || typeof data?.playerId !== 'string' || typeof data?.roomName !== 'string')
      return ;

    const game = this.gamesMap.get(data.roomName);
    if (game === undefined)
      return ; // TO DO : emit something saying game crashed

    if (game.clientOne.socket.id != client.id)
    {
      console.log('socket meddling in startGameLoop')
      return;
    }
    else
      this.gamePlayService.gameLoop(this.gamesMap, this.gamesMap.get(data.roomName), data, client, this.server);
  }

  @SubscribeMessage('gameInvite')
  gameInvite(@MessageBody() data : {targetId : string}, @ConnectedSocket() client : Socket) {

    if (data === undefined || data === null || typeof data.targetId != 'string')
    {
      console.log('')
      return ;
    }
  }

  @SubscribeMessage('availabilityChange')
  availabilityChange(@MessageBody() bool : boolean, @ConnectedSocket() client: Socket) {
    
    if (typeof bool !== 'boolean')
    {
      console.log("wrong type in availibityChange")
      return ;
    }

    try {
      this.userService.findOneById(client.handshake.query?.userId as string)?.then((user) => {

        if (bool === true) {
          this.userService.update(user.id, {isAvailable : bool});
        }
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
        this.userService.findOneById(client.handshake.query?.userId as string)?.then((user) => {

        user.gameSockets.forEach((value) => {
          this.server.to(value).emit('logout');
        })
      })
    }
    catch(e) {
      console.log('in availability change ERROR : ', e);
    }
  }


  // TO DO : Remove This
  @SubscribeMessage('ping')
  ping(@MessageBody() data : any, @ConnectedSocket() client: Socket) {
    console.log('PINGED DATA : ', data)
  }
}

