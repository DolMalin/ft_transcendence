import { Injectable } from '@nestjs/common';
// import { GameServDTO} from './game.gateway';
import { Socket, Server } from 'socket.io';
import {
  GameState,
  GameInfo,
  GameMetrics,
  } from '../globals/interfaces'
import { 
  willBallCollideWithWall,
  willBallOverlapPaddleOne,
  willBallOverlapPaddleTwo,
  goal,
  ballReset,
  randomizeBallAngle,
  ballRelaunch
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

@Injectable()
export class GamePlayService {

  constructor(

    private readonly usersService : UsersService
) {}

  // ********************************* PADDLE ********************************* //


  movingStarted(game : GameState, data: {key : string, playerId : string, room : string}, clientId : string) {

    if (game === undefined)
      return ;

    if (data.playerId === '1' && game.clientOne.socket.id != clientId)
    {
      console.log('socket meddling in movingStarted')
      return ;
    }
    else if (data.playerId === '2' && game.clientTwo.socket.id != clientId)
    {
      console.log('socket meddling in movingStarted')
      return ;
    }

    switch (data.key.toLowerCase())
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

  movingStopped(game : GameState, data: {key : string, playerId : string, room : string}, clientId : string) {

    if (game === undefined)
      return ;

    if (data.playerId === '1' && game.clientOne.socket.id != clientId)
    {
      console.log('socket meddling in movingStopped')
      return ;
    }
    else if (data.playerId === '2' && game.clientTwo.socket.id != clientId)
    {
      console.log('socket meddling in movingStopped')
      return ;
    }

    switch (data.key.toLowerCase())
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

  handlePaddleMovement(game : GameState) {
    
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

  handleBallMovement(game : GameState, data: GameInfo, client : Socket, server : Server) {
    
    if (game === undefined)
    {
      console.log("TEST TEST TEST")
      return ('gameOver');
    }

    if (goal(server, game,data.roomName, game.ball))
    {
      if (game.clientOneScore >= Constants.SCORE_TO_REACH)
      {
        game.winner = game.clientOne.id;
        game.looser = game.clientTwo.id;
        return ('gameOver')
      }
      else if (game.clientTwoScore >= Constants.SCORE_TO_REACH)
      {
        game.winner = game.clientTwo.id;
        game.looser = game.clientOne.id;
        return ('gameOver')
      }
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

  /**
 * @description 
 * pause the game after a point and relaunch the ball
 *  | need server and roomName to send ball pos to front
*/
  pauseBetweenPoints(game : GameState, server : Server, roomName : string) {

    let ct = 3;
    const int = setInterval(() =>{
        server.to(roomName).emit('midPointCt', ct);
        if (ct === -1)
        {
            clearInterval(int)
            ballRelaunch(game?.ball)
            
            server.to(roomName).emit('midPointCtEnd');
            return ;
        }
        ct --
    }, 1000);
  }

  async getUserBasicInfos(id : string) {
    try {
      const res = await this.usersService.findOneById(id);
      return ({id : id, username : res.username});    
    }
    catch (e) {
      console.log(e);
    } 
  }
  
  async gameLoop(gamesMap : Map <string, GameState>,game : GameState, data: GameInfo, client : Socket, server : Server) {
    
    let ballEvents : string = 'start';

    if (game === undefined)
      return ;

    server.to(data.roomName).emit('gameStarted', 
    await this.getUserBasicInfos(game.clientOne.id), await this.getUserBasicInfos(game.clientTwo.id));
    
    game.ballRefreshInterval = setInterval(() => {
      
        ballEvents = this.handleBallMovement(game, data, client, server);
          
        this.handlePaddleMovement(game);

        if (game.isPaused === true)
        {
          game.isPaused = false;
          ballReset(game.ball);
          this.pauseBetweenPoints(game, server, data.roomName);
        }
        else if (ballEvents === 'goal')
        {
          this.pauseBetweenPoints(game, server, data.roomName);
        }
        else if (ballEvents === 'gameOver')
        {
          server.to(data.roomName).emit('gameOver', game.winner);
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
