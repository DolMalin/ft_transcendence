import { Injectable } from '@nestjs/common';
import { GameServDTO} from './game.gateway';
import { Socket, Server } from 'socket.io';
import {
  Game,
  GameInfo,
  Ball,
  Paddle,
} from './interfaces'
import * as Constants from './const'

function roomNameGenerator(lenght : number, map : Map<string, Set<string>>)
{
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
    addClientToRoom(gameServDto : GameServDTO, index : number, roomName : string, client : Socket, gameType : string | string []) {
        
        gameServDto.rooms[index].name = roomName;
        gameServDto.rooms[index].clients.push(client.id);
        gameServDto.rooms[index].gameType = gameType
        client.join(roomName);
      }

    /**
     * @description create a room on client request and fill the GameServDTO
     */
    createRoom(gameServDto : GameServDTO, roomName : string, client : Socket, gameType : string | string []) {
        
        gameServDto.rooms.push({name : roomName, clients : [client.id], gameType : gameType})
        client.join(roomName);
      
      }

    gameCreation (server : Server, client : Socket, gameServDto : GameServDTO, gameType : string) {
                
        if (client.rooms.size >= 2)
        {
          client.emit('allreadyInGame', "You are allready in a game you Gourmand !")
          return ;
        }
        
        // look for open rooms and join them
        
        for (let i = 0; server.sockets.adapter.rooms.size > 1 && i < gameServDto.rooms.length; i ++)
        {
          if (server.sockets.adapter.rooms.get(gameServDto.rooms[i].name) &&
          server.sockets.adapter.rooms.get(gameServDto.rooms[i].name).size < 2 &&
          gameServDto.rooms[i].gameType === gameType)
          {
    
            this.addClientToRoom(gameServDto, i, gameServDto.rooms[i].name, client, gameType)
            server.to(gameServDto.rooms[i].name).emit('roomFilled');
            client.emit('roomName', gameServDto.rooms[i].name);
            client.emit('playerId', '1');
            return ;
          }
        }

        //  if none exist, create one
        
        let roomName = roomNameGenerator(10, server.sockets.adapter.rooms);
        
        this.createRoom(gameServDto, roomName, client, gameType)
        client.emit('roomName', roomName);
        client.emit('playerId', '2');
    }

    launchGame (server : Server, gamesMap : Map<string, Game>, client : Socket,data : GameInfo) {
         
    // console.log(data.roomName)
    // console.log(gamesMap);

    let paddleWidth = 0.15;
    let paddleHeight = 0.02;

    if (data.playerId === "1")
    {
      let game : Game = {
        clientOne : client.id,
        clientTwo : '',
        gameType  : data.gameType,
        paddleOne : {
          x : 0.5 - paddleWidth / 2,
          y : 1 - paddleHeight,
          width : paddleWidth,
          height : paddleHeight,
        },
        paddleTwo : {
          x : 0.5 - paddleWidth / 2,
          y : 0,
          width : paddleWidth,
          height : paddleHeight,
        },
        ball : {
          x : 0.5,
          y : 0.5,
          size : 0.020,
          color : 'white',
          directionalVector : {x : 0.5, y : 0.5},
          angle : Math.floor(Math.random() * 360),
          speed : 0.4 / 60,
        },
        ballRefreshInterval : undefined,
      }
      gamesMap.set(data.roomName, game);
    }
    else if (gamesMap.get(data.roomName) && data.playerId === '2')
    {
      // let tmp = gamesMap.get(data.roomName);
      // if (tmp)
      gamesMap.get(data.roomName).clientTwo = client.id;
    }
    }

    leaveGame(server : Server, client : Socket, gameServDto : GameServDTO, gamesMap : Map <string, Game>) {

      // remove the user and empty rooms from the DTO

      gameServDto.clientsNumber --;
      gameServDto.clientsId = gameServDto.clientsId.filter((id) => id != client.id);
      gameServDto.rooms = gameServDto.rooms.filter((room) => server.sockets.adapter.rooms.get(room.name) != undefined);
    }
}

@Injectable()
export class GamePlayService {

  handlePaddleMovement(game : Game, data: {key : string, playerId : string, room : string}, client : Socket) {
    
    function MoveY(paddle : Paddle, difY : number) {
      paddle.y += difY;
      paddle.y > 1 - paddle.height ? paddle.y = 1 : paddle.y;
      paddle.y <= 0 ? paddle.y = 0 : paddle.y;
      client.emit('myMoves', paddle.x, paddle.y);
      client.to(data.room).emit('adversaryMoves', paddle.x, paddle.y);
    }
    function MoveX(paddle : Paddle, difX : number) {
      paddle.x += difX;
      paddle.x >= 1 - paddle.width ? paddle.x = 1 - paddle.width : paddle.x;
      paddle.x <= 0 ? paddle.x = 0 : paddle.x;
      client.emit('myMoves', paddle.x, paddle.y);
      client.to(data.room).emit('adversaryMoves', paddle.x, paddle.y);
    }
    
    switch (data.key)
    {
      case Constants.UP :
        console.log('id : ', data.playerId)
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
}