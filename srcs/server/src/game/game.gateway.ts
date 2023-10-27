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
      ball.angle = Math.floor(Math.random() * 360);
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
    
    const ballCollideWithPaddle = (ball : Ball) => {

      console.log('ball top y : ', ball.y - ball.size,  )
      if (ball.y - ball.size <= game.paddleTwo.y + game.paddleTwo.height
        && ball.x - ball.size >= game.paddleTwo.x
        && ball.x + ball.size <= game.paddleTwo.x)
      {
        console.log('hit paddle 1')
        if (ball.angle > 180)
          ball.angle -= 180;
        else if (ball.angle < 180)
          ball.angle += 180;
      }
      if (ball.y + ball.size >= game.paddleOne.y
        && ball.x - ball.size >= game.paddleOne.x
        && ball.x + ball.size <= game.paddleOne.x)
      {
        console.log('hit paddle 2')

        if (ball.angle > 180)
        ball.angle -= 180;
        else if (ball.angle < 180)
          ball.angle += 180;
      }
    }

    const ballCollideWithWall = (ball : Ball) => {
        if (ball.x >= 1 || ball.x <= 0)
        {
          ball.x >= 1 ? ball.x = 1 : ball.x = 0;
          // TO DO : change angle calculation
          if (game.ball.angle > 180)
            game.ball.angle -= 180;
          else if (game.ball.angle < 180)
            game.ball.angle += 180;
          this.server.to(data.roomName).emit('ballInfos', ball);
          return (true);
        }
        else
        return (false);
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
      
    game.ballRefreshInterval = setInterval(() => {
        
        ballCollideWithPaddle(game.ball);
        ballCollideWithWall(game.ball);
        if (goal(game.ball))
        {
          ballReset(game.ball);
          this.server.to(data.roomName).emit('pointScored', game.ball)
          this.server.to(data.roomName).emit('ballInfos', game.ball);
          pauseBetweenPoints(game.ball);
        }
        let Vx = game.ball.speed * Math.cos(game.ball.angle);
        let Vy = game.ball.speed * Math.sin(game.ball.angle)
        
        game.ball.x += Vx;
        game.ball.y += Vy;
        if (client.rooms.size === 0) //TO DO Changer cette immondice
          return (clearInterval(game.ballRefreshInterval))
      }, 1000 / 60);
    }
}
