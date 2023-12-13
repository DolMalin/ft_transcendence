import { OnGatewayConnection,
OnGatewayDisconnect,
SubscribeMessage,
WebSocketGateway,
WebSocketServer,
MessageBody, 
ConnectedSocket} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io'
import { GamePlayService } from '../services/gameplay.services';
import { MatchmakingService } from '../services/match-making-services';
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
import { Logger, NotFoundException } from '@nestjs/common';

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
     if (client.handshake.query?.userId as string === undefined)
     {
       client.disconnect();
       return ;
     }
     const payload = await this.authService.validateAccessJwt(client.handshake.query?.token as string);
      if (client.handshake.query.type !== 'game')
        return;

      const user = await this.userService.findOneById(client.handshake.query?.userId as string);
      await this.userService.addGameSocketId(client.id, user.gameSockets, user);
    }
    catch(e) {
      client.disconnect();
      Logger.error('game gateway handle connection error : ', e?.message)
    }
  }
  
  async handleDisconnect(client: Socket){

    try {
      const user = await this.userService.findOneById(client.handshake.query?.userId as string);
      if (client.handshake.query.type !== 'game')
        return ;
      await this.userService.removeSocketId(client.id, user.gameSockets, user)
    }
    catch(e) {
    Logger.error('game gateway handle disconnection error: ', e?.message);
    }
  }

  @SubscribeMessage('joinGame')
  joinGame(@MessageBody() data : {gameType : string},@ConnectedSocket() client: Socket) {

    if (typeof data?.gameType !== 'string')
    {
      Logger.error('type error in joinGame')
      return ;
    }

    this.matchmakingService.joinGame(this.server, client, client.handshake.query?.userId as string, this.gamesMap, data.gameType);
  }

  @SubscribeMessage('joinDuel')
  async joinDuel(@MessageBody() data : GameInfo, @ConnectedSocket() client : Socket){
    if (typeof data?.gameType !== 'string' || typeof data?.playerId !== 'string' || typeof data?.roomName !== 'string')
    {
      Logger.error('type error in joinDuel')
      return ;
    }

    this.matchmakingService.joinDuel(this.server, client, this.gamesMap, data);
  }

  @SubscribeMessage('leaveGame') // Protected against socket meddling
  leaveGame(@MessageBody() data : GameInfo, @ConnectedSocket() client: Socket) {

    if (data === null || data === undefined || typeof data?.gameType !== 'string' || typeof data?.playerId !== 'string' || typeof data?.roomName !== 'string')
    {
      Logger.error('type error in leaveGame')
      return ;
    }
     
    this.matchmakingService.leaveGame(this.server, client, this.gamesMap, data);
  }

  @SubscribeMessage('leaveQueue') // Protected against socket meddling
  leaveQueue(@MessageBody() data : {roomName : string}, @ConnectedSocket() client: Socket) {

    if (data === null || data === undefined || typeof data?.roomName !== 'string')
    {
      Logger.error('type error in leaveQueue')
      return ;
    }

    this.matchmakingService.leaveQueue(data, this.gamesMap, client, this.server);
  }

  @SubscribeMessage('playerMove') // Protected against socket meddling
  playerMove(@MessageBody() data: {key : string, playerId : string, room : string}, @ConnectedSocket() client: Socket) {
    
    if (typeof data?.key !== 'string' || typeof data?.playerId !== 'string' || typeof data?.room !== 'string' )
    {
      Logger.error('type error in playerMove')
      return ;
    }

    this.gamePlayService.movingStarted(this.gamesMap.get(data.room), data, client.id)
  }

  @SubscribeMessage('playerMoveStopped') // Protected against socket meddling
  playerMoveStopped(@MessageBody() data: {key : string, playerId : string, room : string}, @ConnectedSocket() client: Socket) {
    
    if (typeof data.key !== 'string' || typeof data.playerId !== 'string' || typeof data.room !== 'string' )
    {
      Logger.error('type error in playerMoveStopped')
      return ;
    }

    this.gamePlayService.movingStopped(this.gamesMap.get(data.room), data, client.id)
  }

  @SubscribeMessage('startGameLoop') // Protected against socket meddling
  async startGameLoop(@MessageBody() data : GameInfo, @ConnectedSocket() client: Socket) {
    
    if (data === undefined || data === null || 
    typeof data?.gameType !== 'string' || typeof data?.playerId !== 'string' || typeof data?.roomName !== 'string')
    {
      Logger.error('type error in startGameLoop')
      return ;
    }

    const game = this.gamesMap.get(data.roomName);
    if (game === undefined)
    {
      Logger.error('game undefined in startGameLoop')
      return ;
    }

    else
      await this.gamePlayService.gameLoop(this.gamesMap.get(data.roomName), data, client, this.server);
  }

  @SubscribeMessage('availabilityChange')
  async availabilityChange(@MessageBody() bool : boolean, @ConnectedSocket() client: Socket) {
    
    if (typeof bool !== 'boolean')
    {
      Logger.error('type error in availibilityChange')
      return ;
    }

    try {
      const user = await this.userService.findOneById(client.handshake.query?.userId as string);
      if (bool === true) {
        this.userService.update(user.id, {isAvailable : bool});
      }
      await this.userService.emitToAllSockets(this.server, user.gameSockets, 'isAvailable', {bool :bool})
      await this.userService.emitToAllSockets(this.server, user.gameSockets, 'isAvailable', {bool})
    }
    catch(e) {
      Logger.error('In availibilityChange : ', e?.message)
    }
  }

  @SubscribeMessage('logout')
  async logout(@ConnectedSocket() client: Socket) {
    
    this.availabilityChange(true, client);
    this.handleDisconnect(client);
    try {
      const user = await this.userService.findOneById(client.handshake.query?.userId as string);
  
      await this.userService.emitToAllSockets(this.server, user.gameSockets, 'logout', undefined);
  
      this.gamesMap.forEach((value, key) => {
        if (value.clientOne.id === user.id || value.clientTwo.id === user.id)
          this.matchmakingService.leaveGame(this.server, client, this.gamesMap, 
          {roomName : key, playerId : value.clientOne.id === user.id ? '1' : '2', gameType : value.gameType});
      })
      user.gameSockets = [];
      this.userService.save(user);
    }
    catch(e) {
      Logger.error('In logout : ', e?.message)
    }
  }

  @SubscribeMessage('gameInvite')
  async gameInvite(@MessageBody() data : {targetId : string, gameType : string}, @ConnectedSocket() client : Socket) {

    if (data === undefined || data === null || typeof data.targetId != 'string' || typeof data.gameType != 'string')
    {
      Logger.error('type error in GameInvite : ')
      return ;
    }

    try {
      await this.matchmakingService.gameInvite(this.server, client.id,
      client.handshake.query.userId as string, data.targetId, data.gameType);
    }
    catch(e) {
      Logger.error('in gameInvite : ', e?.message);
    }
  }

  @SubscribeMessage('acceptedInvite')
  async acceptedInvite(@MessageBody() data : {senderSocketId : string, senderId : string, gameType : string}, @ConnectedSocket() client : Socket) {
    
    if (data === undefined || data === null || typeof data.senderSocketId != 'string' || typeof data.senderId != 'string' || typeof data.gameType != 'string')
    {
      Logger.error('type error in acceptedInvite : ')
      return ;
    }

    try {
      await this.matchmakingService.inviteWasAccepted(this.server, data.senderSocketId, client.id,
        data.senderId, client.handshake.query.userId as string, data.gameType)
    }
    catch (e) {
      Logger.error('in accepted invite : ', e?.message);
    }
  }

  @SubscribeMessage('declinedInvite')
  async declinedInvite(@MessageBody() data : {senderId : string}, @ConnectedSocket() client : Socket) {
    if (data === undefined || data === null || typeof data.senderId != 'string')
    {
      Logger.error('type error in declinedInvite : ')
      return ;
    }
    try {
      await this.matchmakingService.inviteWasDeclined(this.server, data.senderId, client.handshake.query.userId as string)
    }
    catch(e) {
      Logger.error('in declined invite : ', e?.message);
    }
  }

  @SubscribeMessage('closeOpenedModals')
  closeOpenedModals(@ConnectedSocket() client : Socket) {
    client.emit('closeModal');
  }
}

