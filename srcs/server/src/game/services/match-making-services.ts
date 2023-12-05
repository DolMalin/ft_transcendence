import { Injectable } from '@nestjs/common';
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

    async gameCreation (server : Server, client : Socket, dbUserId : string,gamesMap : Map<string, GameState>, gameType : string) {
      
        // look for open rooms and join them
        try 
        {
          const user = await this.userService.findOneById(client.handshake.query.userId as string);
          for (const [key, value] of gamesMap) 
          {
            if (value.gameIsFull === false && value.gameType === gameType && dbUserId !== value.clientOne.id)
            {
              // server.to(key).emit('playerId', {id : '2'});
              // server.to(key).emit('roomName', {roomName : key});
              this.addClientToRoom(gamesMap, key, client, dbUserId)
              this.userService.emitToAllSockets(server, user.gameSockets, 'playerId', {id : '2'})
              this.userService.emitToAllSockets(server, user.gameSockets, 'roomName', {roomName : key})
              server.to(key).emit('roomFilled', {gameType : gameType});
                // this.userService.emitToAllSockets(server, user.gameSockets, 'roomFilled', {gameType : gameType})
                return ;
              }
            }
            
            //  if none exist, create one
            
            let roomName = roomNameGenerator(10, server.sockets.adapter.rooms);
            
            this.createRoom(gamesMap, roomName, client, dbUserId, gameType)
            // server.to(roomName).emit('playerId', {id : '1'});
            // server.to(roomName).emit('roomName', {roomName : roomName});
            this.userService.emitToAllSockets(server, user.gameSockets, 'playerId', {id : '1'})
            this.userService.emitToAllSockets(server, user.gameSockets, 'roomName', {roomName : roomName})
          }
        catch(e) {
          console.log('Error in game creation : ', e)
        }
    }

    leaveGame(server : Server, client : Socket, gamesMap : Map <string, GameState>, data : GameInfo) {

      let game : GameState = gamesMap.get(data.roomName);
      if (game === undefined)
        return ;
      
      if (data.playerId === '1' && !this.userService.doesSocketBelongToUser(game.clientOne.socket))
      {
        console.log('socket meddling in leaveGame');
        return ;
      }
      else if (data.playerId === '2' && !this.userService.doesSocketBelongToUser(game.clientTwo.socket))
      {
        console.log('socket meddling in leaveGame');
        return ;
      }

      clearInterval(game.ballRefreshInterval);
      if (game.gameIsFull === false)
      {
        client.leave(data.roomName);
        gamesMap.delete(data.roomName);
      }
      else if (data.playerId === '1')
      {
        if (game.winner === undefined)
        {
          game.winner = game.clientTwo.id;
          game.looser = game.clientOne.id;
        }
      
        server.to(data.roomName).emit('gameOver', {winner : game.clientTwo.socket.id});
        game.clientOne.socket.leave(data.roomName);
        game.clientTwo.socket.leave(data.roomName);
      }
      else if (data.playerId === '2')
      {
        if (game.winner === undefined)
        {
          game.winner = game.clientOne.id;
          game.looser = game.clientTwo.id;
        }
        server.to(data.roomName).emit('gameOver', {winner : game.clientOne.socket.id});
        game.clientOne.socket.leave(data.roomName);
        game.clientTwo.socket.leave(data.roomName);
      }
      this.matchHistoryServices.storeGameResults(game);
      gamesMap.delete(data.roomName);
    }

    async leaveQueue(data : {roomName : string}, gamesMap : Map<string, GameState>, client : Socket, server : Server) {

      const game = gamesMap.get(data.roomName);
      if (game === undefined)
      {
        console.log('undefined game in leaveQueue', data.roomName)
        return;
      }

      if (this.userService.doesSocketBelongToUser(game.clientOne.socket))
      {
        gamesMap.delete(data.roomName);
        
        client.leave(data.roomName);
        try {
          const user = await this.userService.findOneById(client.handshake.query.userId as string);
          this.userService.update(user.id, {isAvailable : true});
          this.userService.emitToAllSockets(server, user.gameSockets, 'isAvailable', {bool : true})
        }
        catch(e) {
          console.log('in availability change ERROR : ', e);
        }
      }
      else
      {
        console.log('socket meddling in leave queue')
        return ;
      }
    }

    async gameInvite(server : Server,senderId : string, targetId : string, gameType : string) {

        try {
            const target : User = await this.userService.findOneById(targetId);
            if (target === undefined)
            {
                console.log('invite target undefined')
                return ;
            }

            
            const sender : User = await this.userService.findOneById(senderId);
            if (sender === undefined)
            {
                console.log('invite sender undefined')
                return ;
            }

            if (target.isAvailable === false)
            {
              this.userService.emitToAllSockets(server, sender.gameSockets, 'isBusy', {username : target.username})
              return ;
            }

            this.userService.emitToAllSockets(server, target.gameSockets, 'gotInvited',
            {senderId : sender.id, senderUsername : sender.username, gameType : gameType})
        }
        catch (e) {
            console.log('Game Invite Error : ', e.message)
        }
    }

    async inviteWasDeclined(server : Server, senderId : string, targetId : string) {
        try {
            const target : User = await this.userService.findOneById(targetId);
            if (target === undefined)
            {
                console.log('invite target undefined')
                return ;
            }
            
            const sender : User = await this.userService.findOneById(senderId);
            if (sender === undefined)
            {
                console.log('invite sender undefined')
                return ;
            }
            this.userService.emitToAllSockets(server, sender.gameSockets, 'inviteDeclined', {username : target.username})
        }
        catch (e) {
            console.log('Game Invite Declined Error : ', e.message)
        }
    }

    async inviteWasAccepted(server : Server, senderId : string, targetId : string, gameType : string) {
        try {
            const target : User = await this.userService.findOneById(targetId);
            if (target === undefined)
            {
                console.log('invite target undefined')
                return ;
            }
            
            const sender : User = await this.userService.findOneById(senderId);
            if (sender === undefined)
            {
                console.log('invite sender undefined')
                return ;
            }

            if (sender.isAvailable === false || target.isAvailable === false) 
            {
                console.log('one of the players is unavailable');
                return ;
            }
            else
            {
              const roomName = roomNameGenerator(20, server.sockets.adapter.rooms);

              await this.userService.update(sender.id, {isAvailable : false});
              this.userService.emitToAllSockets(server, sender.gameSockets,
              'duelAccepted', {gameType : gameType, roomName : roomName, playerId : '1'})

              await this.userService.update(target.id, {isAvailable : false});
              this.userService.emitToAllSockets(server, target.gameSockets,
              'duelAccepted', {gameType : gameType, roomName : roomName, playerId : '2'})
            }
        }
        catch (e) {
            console.log('Game Invite Declined Error : ', e.message)
        }
    }

    duelCreation(server : Server, gamesMap : Map<string, GameState>, client : Socket, data : GameInfo) {
        
        client.join(data.roomName);

        let game : GameState = {
          clientOne : {socket : client, id : client.handshake.query?.userId as string},
          clientTwo : undefined,
          gameIsFull : true, // true to avoid other from joining
          isPaused : true,
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