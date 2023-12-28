import { Injectable, Logger } from '@nestjs/common';
// import { GameServDTO} from './game.gateway';
import { Socket, Server } from 'socket.io';
import {
  GameState,
  GameInfo,
  } from '../globals/interfaces'
import { 
  randomizeBallAngle,
  } from './BallMoves';
import * as Constants from '../globals/const'
import { MatchHistoryService } from './match.history.services';
import { UsersService } from 'src/users/services/users.service';
import { User } from 'src/users/entities/user.entity';

export function roomNameGenerator(lenght : number, map : Map<string, Set<string>>) {

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

@Injectable()
export class MatchmakingService {

  constructor(

    private readonly matchHistoryServices : MatchHistoryService,
    private readonly userService : UsersService
) {}
    /**
     * @description add client to existing room, fill the GameServDTO
     */
    addClientToRoom(gamesMap : Map<string, GameState>, roomName : string, client : Socket, dbUserId : string) {
        
        gamesMap.get(roomName).clientTwo = {socket : client, id : dbUserId};
        gamesMap.get(roomName).gameIsFull = true;
        client.join(roomName);
      }

    /**
     * @description create a room on client request and fill the GameServDTO
     */
    createRoom(gamesMap : Map<string, GameState>, roomName : string, client : Socket, dbUserId : string,gameType : string) {
      
        client.join(roomName);

        let game : GameState = {
          clientOne : {socket : client, id : dbUserId},
          clientTwo : undefined,
          gameIsFull : false,
          isPaused : true,
          hasStarted : false,
          clientOneScore : 0,
          clientTwoScore : 0,
          winner : undefined,
          looser : undefined,
          gameType  : gameType,
          paddleOne : {
            x : 0.5 - Constants.PADDLE_WIDTH / 2,
            y : 1 - Constants.PADDLE_HEIGHT,
            movingLeft : false,
            movingRight : false,
            speed : Constants.PADDLE_SPEED,
            width : gameType === Constants.GAME_TYPE_TWO ? Constants.PADDLE_WIDTH * 2: Constants.PADDLE_WIDTH,
            height : Constants.PADDLE_HEIGHT,
            hitCount : 0,
          },
          paddleTwo : {
            x : 0.5 - Constants.PADDLE_WIDTH / 2,
            y : 0,
            movingLeft : false,
            movingRight : false,
            speed : Constants.PADDLE_SPEED,
            width : gameType === Constants.GAME_TYPE_TWO ? Constants.PADDLE_WIDTH * 2: Constants.PADDLE_WIDTH,
            height : Constants.PADDLE_HEIGHT,
            hitCount : 0,
          },
          ball : {
            x : 0.5,
            y : 0.5,
            size : Constants.BALL_SIZE,
            color : 'white',
            angle : randomizeBallAngle(),
            speed : Constants.BALL_SPEED,
          },
          ballRefreshInterval : undefined,
        }
        
        gamesMap.set(roomName, game);
      }

    async joinGame(server : Server, client : Socket, dbUserId : string,gamesMap : Map<string, GameState>, gameType : string) {
      
      try {
        const user = await this.userService.findOneById(client.handshake.query.userId as string);
        if (user.isAvailable === true)
        {
          this.userService.update(user.id, {isAvailable : false});
          this.userService.emitToAllSockets(server, user.gameSockets, 'isAvailable', {bool : false})
        }
        else 
        {
          Logger.error(user.username + 'is not available');
        }
      }
      catch(err) {
        Logger.error(`${err.response?.data?.message} (${err.response?.data?.error})`)
      }

      for (const [key, value] of gamesMap) 
      {
        if (value.gameIsFull === false && value.gameType === gameType && dbUserId !== value.clientOne.id)
        {
          this.addClientToRoom(gamesMap, key, client, dbUserId)
          client.emit('playerId', {id : '2'});
          client.emit('roomName', {roomName : key});
          server.to(key).emit('roomFilled', {gameType : gameType});
          return ;
        }
      }
      const roomName = roomNameGenerator(10, server.sockets.adapter.rooms);
      
      this.createRoom(gamesMap, roomName, client, dbUserId, gameType)
      client.emit('playerId', {id : '1'});
      client.emit('roomName', {roomName : roomName});
    }

    async joinDuel(server : Server, client : Socket, gamesMap : Map<string, GameState>, data : GameInfo) {
      
      try {
        const user = await this.userService.findOneById(client.handshake.query.userId as string);
        if (user.isAvailable === true)
        {
          this.userService.update(user.id, {isAvailable : false});
          this.userService.emitToAllSockets(server, user.gameSockets, 'isAvailable', {bool : false})
        }
        else 
        {
          Logger.error(user.username + 'is not available');
        }
      }
      catch(err) {
        Logger.error(`${err.response?.data?.message} (${err.response?.data?.error})`)
      }
      
      if (gamesMap.get(data.roomName) === undefined)
      {
        this.duelCreation(server, gamesMap, client, data);
        client.emit('playerId', {id : '1'})
        client.emit('roomName', {roomName : data.roomName})
      }
      else 
      {
        this.addClientToRoom(gamesMap, data.roomName, client, client.handshake.query?.userId as string);
        client.emit('playerId', {id : '2'})
        client.emit('roomName', {roomName : data.roomName})
        server.to(data.roomName).emit('roomFilled', {gameType : data.gameType});
      }
    }

    leaveGame(server : Server, client : Socket, gamesMap : Map <string, GameState>, data : GameInfo) {

      let game : GameState = gamesMap.get(data.roomName);
      if (game === undefined)
        return ;
      
      if (data.playerId === '1' && client.id != game.clientOne.socket.id)
      {
        Logger.error('socket meddling in leaveGame');
        return ;
      }
      else if (data.playerId === '2' && client.id != game.clientTwo.socket.id)
      {
        Logger.error('socket meddling in leaveGame');
        return ;
      }
      clearInterval(game.ballRefreshInterval);

      // WHAT PURPOSE DOES THIS SERVER, WHY DID YOU WRITE THAT YOU CUCK
      // if (game.gameIsFull === false)
      // {
      //   client.leave(data.roomName);
      //   gamesMap.delete(data.roomName);
      //   return ;
      // }
      if (data.playerId === '1')
      {
        if (game.winner === undefined)
        {
          game.winner = game.clientTwo.id;
          game.looser = game.clientOne.id;
        }
      
        server.to(data.roomName).emit('gameOver', {winner : game.winner});
      }
      else if (data.playerId === '2')
      {
        if (game.winner === undefined)
        {
          game.winner = game.clientOne.id;
          game.looser = game.clientTwo.id;
        }
        server.to(data.roomName).emit('gameOver', {winner : game.winner});
      }
      try {
        this.matchHistoryServices.storeGameResults(game);
        this.userService.update(game.clientOne.id, {isAvailable : true});
        this.userService.update(game.clientTwo.id, {isAvailable : true});
      }
      catch(e) {
        Logger.error('could not store game in DB', e?.message);
      }
      gamesMap.delete(data.roomName);
      client.leave(data.roomName);
    }

      async leaveQueue(data : {roomName : string}, gamesMap : Map<string, GameState>, client : Socket, server : Server) {

      const game = gamesMap.get(data.roomName);
      if (game === undefined)
      {
        Logger.error('undefined game in leaveQueue :' + data.roomName)
        return;
      }

      if (client.id === game.clientOne.socket.id)
      {
        gamesMap.delete(data.roomName);
        
        client.leave(data.roomName);
        try {
          const user = await this.userService.findOneById(client.handshake.query.userId as string);
          this.userService.update(user.id, {isAvailable : true});
          this.userService.emitToAllSockets(server, user.gameSockets, 'isAvailable', {bool : true})
        }
        catch(e) {
          Logger.error('in availability change : ', e?.message);
        }
      }
      else
      {
        Logger.error('socket meddling in leave queue')
        return ;
      }
    }

    async gameInvite(server : Server, senderSocketId : string, senderId : string, targetId : string, gameType : string) {

        try {
            const target : User = await this.userService.findOneByIdWithBlockRelation(targetId);
            if (target === undefined)
            {
                Logger.error('invite target undefined')
                return ;
            }

            
            const sender : User = await this.userService.findOneByIdWithBlockRelation(senderId);
            if (sender === undefined)
            {
                Logger.error('invite sender undefined')
                return ;
            }

            if (sender.isAvailable === false)
            {
              this.userService.emitToAllSockets(server, sender.gameSockets, 'isBusy', {username : 'You'})
              return ;
            }

            if (this.userService.isAlreadyBlocked(target, sender) === true)
            {
              this.userService.emitToAllSockets(server, sender.gameSockets, 'blockedYou', {username : target.username})
              return ;
            }

            if (target.isAvailable === false)
            {
              this.userService.emitToAllSockets(server, sender.gameSockets, 'isBusy', {username : target.username})
              return ;
            }

            this.userService.emitToAllSockets(server, target.gameSockets, 'gotInvited',
            {senderSocketId : senderSocketId,senderId : sender.id, senderUsername : sender.username, gameType : gameType})
        }
        catch (e) {
          Logger.error('Game Invite Error : ', e?.message)
        }
    }

    async inviteWasDeclined(server : Server, senderId : string, targetId : string) {
        try {
            const target : User = await this.userService.findOneById(targetId);
            if (target === undefined)
            {
                Logger.error('invite target undefined')
                return ;
            }
            
            const sender : User = await this.userService.findOneById(senderId);
            if (sender === undefined)
            {
                Logger.error('invite sender undefined')
                return ;
            }
            this.userService.emitToAllSockets(server, sender.gameSockets, 'inviteDeclined', {username : target.username})
        }
        catch (e) {
            Logger.error('game invite declined error : ', e.message)
        }
    }

    async inviteWasAccepted(server : Server, senderSocketId : string, targetSocketId : string,senderId : string, targetId : string, gameType : string) {
        try {
            const target : User = await this.userService.findOneById(targetId);
            if (target === undefined)
            {
                Logger.error('invite target undefined')
                return ;
            }
            
            const sender : User = await this.userService.findOneById(senderId);
            if (sender === undefined)
            {
                Logger.error('invite sender undefined')
                return ;
            }

            if (/*sender.isAvailable === false ||*/ target.isAvailable === false) 
            {
                Logger.error('one of the players is unavailable');
                return ;
            }
            else
            {
              const roomName = roomNameGenerator(20, server.sockets.adapter.rooms);

              this.userService.update(sender.id, {isAvailable : false});
              server.to(senderSocketId).emit('duelAccepted', {gameType : gameType, roomName : roomName, playerId : '1'});
              server.to(targetSocketId).emit('duelAccepted', {gameType : gameType, roomName : roomName, playerId : '2'});
            }
        }
        catch (e) {
            Logger.error('Game Invite Declined Error : ', e.message)
        }
    }

    duelCreation(server : Server, gamesMap : Map<string, GameState>, client : Socket, data : GameInfo) {
        
        client.join(data.roomName);

        let game : GameState = {
          clientOne : {socket : client, id : client.handshake.query?.userId as string},
          clientTwo : undefined,
          gameIsFull : true,
          isPaused : true,
          hasStarted : false,
          clientOneScore : 0,
          clientTwoScore : 0,
          winner : undefined,
          looser : undefined,
          gameType  : data.gameType,
          paddleOne : {
            x : 0.5 - Constants.PADDLE_WIDTH / 2,
            y : 1 - Constants.PADDLE_HEIGHT,
            movingLeft : false,
            movingRight : false,
            speed : Constants.PADDLE_SPEED,
            width : data.gameType === Constants.GAME_TYPE_TWO ? Constants.PADDLE_WIDTH * 2: Constants.PADDLE_WIDTH,
            height : Constants.PADDLE_HEIGHT,
            hitCount : 0,
          },
          paddleTwo : {
            x : 0.5 - Constants.PADDLE_WIDTH / 2,
            y : 0,
            movingLeft : false,
            movingRight : false,
            speed : Constants.PADDLE_SPEED,
            width : data.gameType === Constants.GAME_TYPE_TWO ? Constants.PADDLE_WIDTH * 2: Constants.PADDLE_WIDTH,
            height : Constants.PADDLE_HEIGHT,
            hitCount : 0,
          },
          ball : {
            x : 0.5,
            y : 0.5,
            size : Constants.BALL_SIZE,
            color : 'white',
            angle : randomizeBallAngle(),
            speed : Constants.BALL_SPEED,
          },
          ballRefreshInterval : undefined,
        }
        
        gamesMap.set(data.roomName, game);
    }
}