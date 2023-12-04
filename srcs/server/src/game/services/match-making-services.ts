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
        client.emit('roomName', roomName);
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

    gameCreation (server : Server, client : Socket, dbUserId : string,gamesMap : Map<string, GameState>, gameType : string) {
      
        if (client.rooms.size >= 2)
        {
          client.emit('allreadyInGame', "You are allready in a game you Gourmand !")
          return ;
        }
        
        // look for open rooms and join them

        for (const [key, value] of gamesMap) 
        {
          if (value.gameIsFull === false && value.gameType === gameType && dbUserId !== value.clientOne.id)
          {
            this.addClientToRoom(gamesMap, key, client, dbUserId)
            server.to(key).emit('roomFilled');
            client.emit('playerId', '2'); // was one not 2 might cause trouble
            return ;
          }
        }

        //  if none exist, create one
        
        let roomName = roomNameGenerator(10, server.sockets.adapter.rooms);
        
        this.createRoom(gamesMap, roomName, client, dbUserId, gameType)
        client.emit('roomName', roomName);
        client.emit('playerId', '1');
    }

    leaveGame(server : Server, client : Socket, gamesMap : Map <string, GameState>, data : GameInfo) {

      let game : GameState = gamesMap.get(data.roomName);
      if (game === undefined)
        return ;
      
      if (data.playerId === '1' && game.clientOne.socket.id != client.id)
      {
        console.log('socket meddling in leaveGame');
        return ;
      }
      else if (data.playerId === '2' && game.clientTwo.socket.id != client.id)
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
      
        server.to(data.roomName).emit('gameOver', game.clientTwo.socket.id);
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
        server.to(data.roomName).emit('gameOver', game.clientOne.socket.id);
        game.clientOne.socket.leave(data.roomName);
        game.clientTwo.socket.leave(data.roomName);
      }
      this.matchHistoryServices.storeGameResults(game);
      gamesMap.delete(data.roomName);
    }

    leaveQueue(data : {roomName : string}, gamesMap : Map<string, GameState>, client : Socket, server : Server) {

      const game = gamesMap.get(data.roomName);
      if (game === undefined)
      {
        console.log('undefined game in leaveQueue', data.roomName)
        return;
      }

      if (game.clientOne.socket.id === client.id)
      {
        gamesMap.delete(data.roomName);
        
        client.leave(data.roomName);
        try {
          this.userService.findOneById(client.handshake.query.userId as string)?.then((user) => {
    
            this.userService.update(user.id, {isAvailable : true});
            user.gameSockets.forEach((value) => {
              server.to(value).emit('isAvailable', true);
            })
          })
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
}