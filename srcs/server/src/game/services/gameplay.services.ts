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

@Injectable()
export class GamePlayService {

  constructor(

    private readonly usersService : UsersService
) {}

  // ********************************* PADDLE ********************************* //


  movingStarted(game : GameState, data: {key : string, playerId : string, room : string}, clientId : string) {

    if (game === undefined)
      return ;

    if (data.playerId === '1' && !this.usersService.doesSocketBelongToUser(game.clientOne.socket))
    {
      console.log('socket meddling in movingStarted')
      return ;
    }
    else if (data.playerId === '2' && !this.usersService.doesSocketBelongToUser(game.clientTwo.socket))
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

    if (data.playerId === '1' && !this.usersService.doesSocketBelongToUser(game.clientOne.socket))
    {
      console.log('socket meddling in movingStopped')
      return ;
    }
    else if (data.playerId === '2' && !this.usersService.doesSocketBelongToUser(game.clientTwo.socket))
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
      return ('gameOver');

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

    console.log('Getting in game loop')

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
          server.to(data.roomName).emit('gameOver', {winner : game.winner});
          return (clearInterval(game.ballRefreshInterval))
        }
        else
        {
          let playerOneMetrics : GameMetrics = {paddleOne : game.paddleOne, paddleTwo : game.paddleTwo, ball : game.ball};
          let PlayerTwoMetrics : GameMetrics = {paddleOne : game.paddleTwo, paddleTwo : game.paddleOne, ball : game.ball};
          server.to(data.roomName).emit('gameMetrics', playerOneMetrics, PlayerTwoMetrics);
        }
        if (client.rooms.size === 0) //TO DO Changer cette immondice
          return (clearInterval(game.ballRefreshInterval))
      }, Constants.FRAME_RATE);
    }
}
