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
    this.matchmakingService.leaveGame(this.server, client, this.gameServDto);
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
  leaveGame(@ConnectedSocket() client: Socket) {

    this.matchmakingService.leaveGame(this.server, client, this.gameServDto);
  }

  @SubscribeMessage('playerMove')
  playerMove(@MessageBody() data: {key : string, playerId : string, room : string}, @ConnectedSocket() client: Socket) {
    
    // const game = this.gamesMap.get(data.room);

    this.gamePlayService.handlePaddleMovement(this.gamesMap.get(data.room), data, client)
  }

  @SubscribeMessage('ballMove')
  ballMove(@MessageBody() data : GameInfo, @ConnectedSocket() client: Socket) {
    const game = this.gamesMap.get(data.roomName);

    game.ball.directionalVector = {x : game.ball.x + Math.random() / 2, y : game.ball.x + Math.random() / 2}
    this.server.to(data.roomName).emit('ballDirection', game.ball.directionalVector, game.ball.speed);
    const ballCollideWithWall = (ball : Ball) => {
      if (ball.x >= 1 || ball.x <= 0)
        return (true)
      else if (ball.y >= 1 || ball.y <= 0)
        return (true)
      else
        return (false);
    } 

    if (game === undefined)
      return ; // TO DO : emit something saying game crashed

    const int = setInterval(() => {
        if (ballCollideWithWall(game.ball))
        {
          // change ball direction
        }
      return (
        clearInterval(int)
      );
    }, 1000 / 60)
  }
  
  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    // Handle received message
    this.server.emit('message', data); // Broadcast the message to all connected clients
  }
}
