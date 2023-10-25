import { Injectable } from '@nestjs/common';
import { GameServDTO} from './game.gateway';
import { Socket, Server } from 'socket.io';
import {
  Game,
  GameInfo,
  Ball
} from './interfaces'

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
            client.emit('playerSide', 'left');
            return ;
          }
        }

        //  if none exist, create one
        
        let roomName = roomNameGenerator(10, server.sockets.adapter.rooms);
        
        this.createRoom(gameServDto, roomName, client, gameType)
        client.emit('roomName', roomName);
        client.emit('playerSide', 'right');
    }

    launchGame (server : Server, gamesMap : Map<string, Game>, client : Socket,data : GameInfo) {
         
    // console.log(data.roomName)
    // console.log(gamesMap);

    let paddleWidth = 0.02;
    let paddleHeight = 0.15;
    let ballSize = 0.1;

    if (data.playerSide === "left")
    {
      let game : Game = {
        clientOne : client.id,
        clientTwo : '',
        gameType  : data.gameType,
        paddleOne : {
          x : 0,
          y : 0.5,
          width : paddleWidth,
          height : paddleHeight,
        },
        paddleTwo : {
          x : 1,
          y : 0.5,
          width : paddleWidth,
          height : paddleHeight,
        },
        ball : {
          x : 0.5,
          y : 0.5,
          size : ballSize,
          color : 'white',
          directionalVector : {x : 0.5, y : 0.5},
          speed : 0.5,
        }
      }
      gamesMap.set(data.roomName, game);
    }
    else if (data.playerSide === 'right')
    {
      // let tmp = gamesMap.get(data.roomName);
      // if (tmp)
      gamesMap.get(data.roomName).clientTwo = client.id;
    }
    }

    leaveGame(server : Server, client : Socket, gameServDto : GameServDTO) {

        // disconnect user from rooms, he supposedly only joined one but who knows

        client.rooms.forEach((value, key, map) => {console.log('disco :', key); client.leave(key);});

        // remove the user and empty rooms from the DTO

        gameServDto.clientsNumber --;
        gameServDto.clientsId = gameServDto.clientsId.filter((id) => id != client.id);
        gameServDto.rooms = gameServDto.rooms.filter((room) => server.sockets.adapter.rooms.get(room.name) != undefined);
    }
}