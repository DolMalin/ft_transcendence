import { Injectable } from '@nestjs/common';
// import { GameServDTO} from './game.gateway';
import { Socket, Server } from 'socket.io';
import {
  Game,
  GameInfo,
  Paddle,
  } from './interfaces'
import { 
  willBallCollideWithWall,
  willBallOverlapPaddleOne,
  willBallOverlapPaddleTwo,
  goal,
  ballReset,
  pauseBetweenPoints,
  randomizeBallAngle,
  } from './BallMoves';
import * as Constants from './const'
import { timeLog, timeStamp } from 'console';

function roomNameGenerator(lenght : number, map : Map<string, Set<string>>) {

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

    /**
     * @description add client to existing room, fill the GameServDTO
     */
    addClientToRoom(gamesMap : Map<string, Game>, roomName : string, client : Socket) {
        
        gamesMap.get(roomName).clientTwo = client;
        gamesMap.get(roomName).gameIsFull = true;
        client.join(roomName);
      }

    /**
     * @description create a room on client request and fill the GameServDTO
     */
    createRoom(gamesMap : Map<string, Game>, roomName : string, client : Socket, gameType : string) {
      
        client.join(roomName);

        let game : Game = {
          clientOne : client,
          clientTwo : undefined,
          gameIsFull : false,
          clientOneScore : 0,
          clientTwoScore : 0,
          Victor : '',
          gameType  : gameType,
          paddleOne : {
            x : 0.5 - Constants.PADDLE_WIDTH / 2,
            y : 1 - Constants.PADDLE_HEIGHT,
            width : Constants.PADDLE_WIDTH,
            height : Constants.PADDLE_HEIGHT,
          },
          paddleTwo : {
            x : 0.5 - Constants.PADDLE_WIDTH / 2,
            y : 0,
            width : Constants.PADDLE_WIDTH,
            height : Constants.PADDLE_HEIGHT,
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

    gameCreation (server : Server, client : Socket, gamesMap : Map<string, Game>, gameType : string) {
                
        if (client.rooms.size >= 2)
        {
          client.emit('allreadyInGame', "You are allready in a game you Gourmand !")
          return ;
        }
        
        // look for open rooms and join them

        for (const [key, value] of gamesMap) 
        {
          if (value.gameIsFull === false && value.gameType === gameType)
          {
            this.addClientToRoom(gamesMap, key, client)
            server.to(key).emit('roomFilled');
            client.emit('roomName', key);
            client.emit('playerId', '2'); // was one not 2 might cause trouble
            return ;
          }
        }

        //  if none exist, create one
        
        let roomName = roomNameGenerator(10, server.sockets.adapter.rooms);
        
        this.createRoom(gamesMap, roomName, client, gameType)
        client.emit('roomName', roomName);
        client.emit('playerId', '1');
    }

    leaveGame(server : Server, client : Socket, gamesMap : Map <string, Game>, data : GameInfo) {

      let game : Game = gamesMap.get(data.roomName);
      if (game === undefined)
        return ;

      if (game.gameIsFull === false)
      {
        client.leave(data.roomName);
        gamesMap.delete(data.roomName);
      }
      else if (data.playerId === '1')
      {
        // set players 2 as winner, send it to DB, PATCH its profile and the leaderboard
        server.to(data.roomName).emit('gameOver', game.clientTwo.id);
        game.clientOne.leave(data.roomName);
        game.clientTwo.leave(data.roomName);
        gamesMap.delete(data.roomName);
      }
      else if (data.playerId === '2')
      {
        // set players 2 as winner, send it to DB, PATCH its profile and the leaderboard
        server.to(data.roomName).emit('gameOver', game.clientOne.id);
        game.clientOne.leave(data.roomName);
        game.clientTwo.leave(data.roomName);
        gamesMap.delete(data.roomName);
      }
    }
}

@Injectable()
export class GamePlayService {

  // ********************************* PADDLE ********************************* //

  handlePaddleMovement(game : Game, data: {key : string, playerId : string, room : string}, client : Socket) {
    

    if (game === undefined)
      return ;
    function MoveY(paddle : Paddle, difY : number) {
      paddle.y += difY;
      paddle.y > 1 - paddle.height ? paddle.y = 1 : paddle.y;
      paddle.y <= 0 ? paddle.y = 0 : paddle.y;
      client.emit('myMoves', paddle);
      client.to(data.room).emit('adversaryMoves', paddle);
    }
    function MoveX(paddle : Paddle, difX : number) {
      paddle.x += difX;
      paddle.x >= 1 - paddle.width ? paddle.x = 1 - paddle.width : paddle.x;
      paddle.x <= 0 ? paddle.x = 0 : paddle.x;
      client.emit('myMoves', paddle);
      client.to(data.room).emit('adversaryMoves', paddle);
    }

    switch (data.key)
    {
      case Constants.UP :
        data.playerId === '1' ? MoveY(game.paddleOne, -Constants.PADDLE_SPEED) : MoveY(game.paddleTwo, -Constants.PADDLE_SPEED)
        break ;
      case Constants.DOWN :
        game.paddleOne.y
        data.playerId === '1' ? MoveY(game.paddleOne, Constants.PADDLE_SPEED) : MoveY(game.paddleTwo, Constants.PADDLE_SPEED)
        break ;
      case Constants.RIGHT :
        data.playerId === '1' ? MoveX(game.paddleOne, Constants.PADDLE_SPEED) : MoveX(game.paddleTwo, Constants.PADDLE_SPEED)
        break ;
      case Constants.LEFT :
        data.playerId === '1' ? MoveX(game.paddleOne, -Constants.PADDLE_SPEED) : MoveX(game.paddleTwo, -Constants.PADDLE_SPEED)
        break ;
      default :
        break;
    }
  }

  // ********************************* BALL ********************************* //

  handleBallMovement (gamesMap : Map <string, Game>,game : Game, data: GameInfo, client : Socket, server : Server) {

    if (game === undefined)
      return ;
    game.ballRefreshInterval = setInterval(() => {
        
        if (goal(server, game,data.roomName, game.ball))
        {
          if (game.clientOneScore >= Constants.SCORE_TO_REACH || game.clientTwoScore >= Constants.SCORE_TO_REACH)
          {
            server.to(data.roomName).emit('gameOver',
            client === game.clientOne ? game.clientOne.id : game.clientTwo.id);
            game.clientOne.leave(data.roomName);
            game.clientTwo.leave(data.roomName);
            gamesMap.delete(data.roomName);

            return (clearInterval(game.ballRefreshInterval))
          }
          ballReset(game.ball);
          server.to(data.roomName).emit('ballInfos', game.ball);
          pauseBetweenPoints(game.ball, server, data.roomName);
        }
        
        let vX = game.ball.speed * Math.cos(game.ball.angle);
        let vY = game.ball.speed * Math.sin(game.ball.angle)

        if (willBallOverlapPaddleOne(game.ball, game.paddleOne, vX, vY) === false &&
          willBallOverlapPaddleTwo(game.ball, game.paddleTwo, vX, vY) === false &&
          willBallCollideWithWall(game.ball, vX) === false)
        {
          game.ball.x += vX;
          game.ball.y += vY;
          server.to(data.roomName).emit('ballInfos', game.ball);
        }
        else {
          
          server.to(data.roomName).emit('ballInfos', game.ball);
        }

        if (client.rooms.size === 0) //TO DO Changer cette immondice
          return (clearInterval(game.ballRefreshInterval))
      }, Constants.FRAME_RATE);
    }
}
