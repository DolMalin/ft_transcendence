import { OnGatewayConnection,
OnGatewayDisconnect,
SubscribeMessage,
WebSocketGateway,
WebSocketServer,
MessageBody, 
ConnectedSocket} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io'
import { MatchmakingService,
GamePlayService } from './game.service';
import * as Constants from './const'
import {
  Game,
  GameInfo,
  Ball,
  Paddle
} from './interfaces'
import { clearInterval } from 'timers';
import { delay } from 'rxjs';

// import { KeyboardEvent } from 'react'

export class GameServDTO {
  clientsNumber : number = 0;
  clientsId : string[] = [];
  rooms : {
    name : string
    clients : string[],
    gameType :string | string [],
  }[] = [];
}


/**
 * @description generate string of lenght size, without ever recreating
 * one that is identical to one of the keys from the map passed as argument
 */



@WebSocketGateway( {cors: {
  // TO DO : remove dat shit
    origin : process.env.CLIENT_URL
  },
} )
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

  gameServDto : GameServDTO = new GameServDTO;
  gamesMap : Map<string, Game> = new Map();
  
  constructor(private readonly matchmakingService: MatchmakingService,
  private readonly gamePlayService : GamePlayService) {}
  
  @WebSocketServer()
  server : Server;
  /**
   * @description make the client join a room if there are some waiting for players,
   * otherwise create its own
   * also send to player if he is player 1 or 2
  */
 handleConnection(client: Socket) {

    this.gameServDto.clientsNumber ++;
    this.gameServDto.clientsId.push(client.id);
  }
  
  handleDisconnect(client: Socket){

    this.matchmakingService.leaveGame(this.server, client, this.gameServDto, this.gamesMap);
  }

  @SubscribeMessage('joinGame')
  joinGame(@MessageBody() gameType : string, @ConnectedSocket() client: Socket) {

    this.matchmakingService.gameCreation(this.server, client, this.gameServDto, gameType);
  }

  @SubscribeMessage('gameStart')
  gameStart(@MessageBody() data : GameInfo, @ConnectedSocket() client : Socket) {

    this.matchmakingService.launchGame(this.server, this.gamesMap, client, data);
  }

  @SubscribeMessage('leaveGame')
  leaveGame(@MessageBody() gameRoom : string, @ConnectedSocket() client: Socket) {

    clearInterval(this.gamesMap.get(gameRoom).ballRefreshInterval);
    this.matchmakingService.leaveGame(this.server, client, this.gameServDto, this.gamesMap);
  }

  @SubscribeMessage('playerMove')
  playerMove(@MessageBody() data: {key : string, playerId : string, room : string}, @ConnectedSocket() client: Socket) {
    
    // const game = this.gamesMap.get(data.room);

    this.gamePlayService.handlePaddleMovement(this.gamesMap.get(data.room), data, client)
  }

  @SubscribeMessage('ballMove')
  ballMove(@MessageBody() data : GameInfo, @ConnectedSocket() client: Socket) {
    const game = this.gamesMap.get(data.roomName);
    if (game === undefined)
      return ; // TO DO : emit something saying game crashed
    
    this.server.to(data.roomName).emit('ballInfos', game.ball);
    
    function ballRelaunch(ball : Ball) {
      ball.angle = Math.floor(Math.random() * 360) *  (Math.PI / 180);
      ball.speed =  0.4 / 60;
    }

    function ballReset(ball : Ball) {
      ball.x = 0.5;
      ball.y = 0.5;
      ball.angle = 0;
      ball.speed = 0;
    }

    const goal = (ball : Ball) => {
      if (ball.y >= 1 || ball.y <= 0)
      {
        ball.y >= 1 ? ball.y = 1 : ball.y = 0;
        return (true)
      }
      else
        return (false)
    }

    const VerticalCollisionAngle = (ball : Ball) => {

      ball.angle = Math.PI - ball.angle;
      if (ball.angle < 0)
        ball.angle = 2 * Math.PI + ball.angle;
    }

    const HorizontalCollisionsAngle = (ball : Ball, paddle : Paddle, paddleId : number) => {
      ball.angle = Math.PI - ball.angle;

      const distanceToPaddleCenter = Math.abs(ball.x - (paddle.x + paddle.width / 2))
      const mitigator = Math.PI / 2 * ( 1 -(distanceToPaddleCenter / ( paddle.width / 2)));
      if (paddleId === 2)
      {
        if (ball.angle * (180 / Math.PI) < 90)
          ball.angle += mitigator;
        else
          ball.angle -= mitigator;
      }
      else if ( paddleId === 1)
      {
        if (ball.angle * (180 / Math.PI) < 270)
          ball.angle += mitigator;
        else
          ball.angle -= mitigator;
      }
    }
    
    
    const pauseBetweenPoints = (ball : Ball) => {
      
      let ct = 2;
      const int = setInterval(() =>{
        ct --
        if (ct === 0)
        {
          clearInterval(int)
          ballRelaunch(ball)
          this.server.to(data.roomName).emit('ballInfos', ball);
          return ;
        }
      }, 1000);
    }

    const willBallCollideWithWall = (ball : Ball, vX : number, vY) => {
      console.log('wall');
        const futureBallX = ball.x + vX;
        if (futureBallX + ball.size >= 1 || futureBallX - ball.size <= 0)
        {
          futureBallX >= 1 ? ball.x = 1 - ball.size - 0.001 : ball.x = 0 + ball.size + 0.001;
          // adjust BallY so it scale with vX diminution
          // futureBallX >= 1 ? ball.y  = (Math.abs(futureBallX - 1) / vX * vY) : ball.y  = (Math.abs(0 - futureBallX) / vX * vY)
          VerticalCollisionAngle(ball);

          // this.server.to(data.roomName).emit('ballInfos', ball);
          console.log('wall colide return true')
          return (true);
        }
        console.log('WallCollide false')
        return (false);
      }
    
    const willBallOverlapPaddleOne = (ball : Ball, paddle : Paddle,vx : number, vy : number) => {
      const futureBallX = ball.x + vx;
      const futureBallY = ball.y + vy;
      console.log('pad1');

      // will ball overlap paddleOne (bottom) next step while comming from above ?
      if (futureBallX - ball.size >= paddle.x && futureBallX - ball.size <= paddle.x + paddle.width
        || futureBallX + ball.size >= paddle.x && futureBallX + ball.size <= paddle.x + paddle.width)
      {
        if (futureBallY >= paddle.y)
        {
          ball.y = paddle.y - ball.size;
          HorizontalCollisionsAngle(ball, paddle, 2);
          console.log('padOne 1')
          return (true);
        }
        console.log('test')
      }
      // will it overlap coming from the left side ?
      else if (futureBallY >= paddle.y && futureBallX + ball.size >= paddle.x)
      {
        ball.x = paddle.x - ball.size;
        VerticalCollisionAngle(ball);
        console.log('padOne 2')
        return (true);
      }
      // will it overlap coming from the right side ?
      else if (futureBallY >= paddle.y && futureBallX - ball.size <= paddle.x + paddle.width)
      {
        ball.x = paddle.x + paddle.width + ball.size;
        VerticalCollisionAngle(ball);
        console.log('padOne 3')
        return (true);
      }
      console.log('paddOne')
      return (false);
    }

    const willBallOverlapPaddleTwo = (ball : Ball, paddle : Paddle,vx : number, vy : number) => {
      const futureBallX = ball.x + vx;
      const futureBallY = ball.y + vy;
      console.log('pad2');



      // will ball overlap paddleTwo (Top) next step while comming from underneath ?
      if (futureBallX - ball.size >= paddle.x && futureBallX - ball.size <= paddle.x + paddle.width
        || futureBallX + ball.size >= paddle.x && futureBallX + ball.size <= paddle.x + paddle.width)
      {
        if (futureBallY <= paddle.y + paddle.height)
        {
          ball.y = paddle.y + paddle.height + ball.size;
          HorizontalCollisionsAngle(ball, paddle, 2);
          console.log('padTwo 1')
          return (true);
        }
      }
      // will it overlap coming from the left side ?
      else if (futureBallY <= paddle.y + paddle.height && futureBallX + ball.size >= paddle.x)
      {
        ball.x = paddle.x - ball.size;
        VerticalCollisionAngle(ball);
        console.log('padTwo 2')
        return (true);
      }
      // will it overlap coming from the right side ?
      else if (futureBallY <= paddle.y + paddle.height && futureBallX - ball.size <= paddle.x + paddle.width)
      {
        ball.x = paddle.x + paddle.width + ball.size;
        VerticalCollisionAngle(ball);
        console.log('padTwo 3')
        return (true);
      }
      console.log('CollidePaddTwo false')
      return (false);
    }

    game.ballRefreshInterval = setInterval(() => {
        
      // console.log('angle : ', game.ball.angle)
      if (goal(game.ball))
        {
          ballReset(game.ball);
          this.server.to(data.roomName).emit('pointScored', game.ball)
          this.server.to(data.roomName).emit('ballInfos', game.ball);
          pauseBetweenPoints(game.ball);
        }
        
        let vX = game.ball.speed * Math.cos(game.ball.angle);
        let vY = game.ball.speed * Math.sin(game.ball.angle)

        if (willBallOverlapPaddleOne(game.ball, game.paddleOne, vX, vY) === false &&
          willBallOverlapPaddleTwo(game.ball, game.paddleTwo, vX, vY) === false &&
          willBallCollideWithWall(game.ball, vX, vY) === false)
        {
          game.ball.x += vX;
          game.ball.y += vY;
        }

        this.server.to(data.roomName).emit('ballInfos', game.ball);

        if (client.rooms.size === 0) //TO DO Changer cette immondice
          return (clearInterval(game.ballRefreshInterval))
      }, 1000 / 60);
    }
}
