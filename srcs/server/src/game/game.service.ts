import { Injectable } from '@nestjs/common';
// import { GameServDTO} from './game.gateway';
import { Socket, Server } from 'socket.io';
import {
  Game,
  GameInfo,
  GameMetrics,
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


  movingStarted(game : Game, data: {key : string, playerId : string, room : string}) {
    switch (data.key)
    {
      case Constants.RIGHT :
        data.playerId === '1' ?  game.paddleOne.movingRight = true : game.paddleTwo.movingRight = true;
        break ;
      case Constants.LEFT :
        data.playerId === '1' ? game.paddleOne.movingLeft = true : game.paddleTwo.movingLeft = true;
        break ;
      default :
        break;
    }
  }

  movingStopped(game : Game, data: {key : string, playerId : string, room : string}) {
    switch (data.key)
    {
      case Constants.RIGHT :
        data.playerId === '1' ?  game.paddleOne.movingRight = false : game.paddleTwo.movingRight = false;
        break ;
      case Constants.LEFT :
        data.playerId === '1' ? game.paddleOne.movingLeft = false : game.paddleTwo.movingLeft = false;
        break ;
      default :
        break;
    }
  }

  handlePaddleMovement(game : Game) {
    
    if (game === undefined)
      return ;

    const distancePerFrame = Constants.PADDLE_SPEED;

    if (game.paddleOne.movingLeft === true)
      game.paddleOne.x -= distancePerFrame;

    else if (game.paddleOne.movingRight === true)
      game.paddleOne.x += distancePerFrame;

    game.paddleOne.x >= 1 - game.paddleOne.width ? game.paddleOne.x = 1 - game.paddleOne.width : game.paddleOne.x;
    game.paddleOne.x <= 0 ? game.paddleOne.x = 0 : game.paddleOne.x;

    if (game.paddleTwo.movingLeft === true)
      game.paddleTwo.x -= distancePerFrame;

    else if (game.paddleTwo.movingRight === true)
      game.paddleTwo.x += distancePerFrame;

    game.paddleTwo.x >= 1 - game.paddleTwo.width ? game.paddleTwo.x = 1 - game.paddleTwo.width : game.paddleTwo.x;
    game.paddleTwo.x <= 0 ? game.paddleTwo.x = 0 : game.paddleTwo.x;
  }

  // ********************************* BALL ********************************* //

  handleBallMovement(game : Game, data: GameInfo, client : Socket, server : Server) {
    
    if (goal(server, game,data.roomName, game.ball))
    {
      if (game.clientOneScore >= Constants.SCORE_TO_REACH || game.clientTwoScore >= Constants.SCORE_TO_REACH)
        return ('gameOver')

      ballReset(game.ball);
      return ('goal')
    }
    
    let vX = game.ball.speed * Math.cos(game.ball.angle);
    let vY = game.ball.speed * Math.sin(game.ball.angle)
    
    if (willBallOverlapPaddleOne(game.ball, game.paddleOne, vX, vY, game.gameType) === false &&
    willBallOverlapPaddleTwo(game.ball, game.paddleTwo, vX, vY, game.gameType) === false &&
    willBallCollideWithWall(game.ball, vX) === false)
    {
      game.ball.x += vX;
      game.ball.y += vY;
    }
    else 
    {
      if (game.ball.speed < Constants.BALL_SPEED * 2)
        game.ball.speed += Constants.BALL_SPEED_INCREMENT;
    }
  }
  
  gameLoop(gamesMap : Map <string, Game>,game : Game, data: GameInfo, client : Socket, server : Server) {
    
    if (game === undefined)
      return ;
    game.ballRefreshInterval = setInterval(() => {

      let ballEvents = this.handleBallMovement(game, data, client, server);

      this.handlePaddleMovement(game);

      if (ballEvents === 'goal')
        pauseBetweenPoints(game.ball, server, data.roomName);
      else if (ballEvents === 'gameOver')
      {
        server.to(data.roomName).emit('gameOver',
        client === game.clientOne ? game.clientOne.id : game.clientTwo.id);
        // TO DO add loose and win to players history
        game.clientOne.leave(data.roomName);
        game.clientTwo.leave(data.roomName);
        gamesMap.delete(data.roomName);
        return (clearInterval(game.ballRefreshInterval))
      }
      else
      {
        let playerOneMetrics : GameMetrics = {paddleOne : game.paddleOne, paddleTwo : game.paddleTwo, ball : game.ball}
        let PlayerTwoMetrics : GameMetrics = {paddleOne : game.paddleTwo, paddleTwo : game.paddleOne, ball : game.ball}
        server.to(data.roomName).emit('gameMetrics', playerOneMetrics, PlayerTwoMetrics)
      }
        
        if (client.rooms.size === 0) //TO DO Changer cette immondice
          return (clearInterval(game.ballRefreshInterval))
      }, Constants.FRAME_RATE);
    }
}
