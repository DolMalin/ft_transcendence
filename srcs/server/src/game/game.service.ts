import { Injectable } from '@nestjs/common';
import { GameServDTO } from './game.gateway';
import { Socket, Server } from 'socket.io';

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
        console.log("ROOMS IN ADD CLIENT:", client.rooms)
      }

    /**
     * @description create a room on client request and fill the GameServDTO
     */
    createRoom(gameServDto : GameServDTO, roomName : string, client : Socket, gameType : string | string []) {
        
        gameServDto.rooms.push({name : roomName, clients : [client.id], gameType : gameType})
        console.log('room name before join :' + roomName, "ROOMS IN ADD ROOM BEFORE JOIN:", client.rooms)
        client.join(roomName);
        console.log("ROOMS IN ADD ROOM:", client.rooms)
      
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
            console.log("CONNECT : "); 
            console.log(gameServDto);
            return ;
          }
        }
        
        // If no accessible room were found, create one

        let roomName = roomNameGenerator(10, server.sockets.adapter.rooms);
        
        this.createRoom(gameServDto, roomName, client, gameType)
        client.emit('playerId', 1);
        console.log("CONNECT : "); 
        console.log(gameServDto);
    }

    leaveGame(server : Server, client : Socket, gameServDto : GameServDTO) {

        // disconnect user from rooms, he supposedly only joined one but who knows

        client.rooms.forEach((value, key, map) => {console.log('disco :', key); client.leave(key);});

        // remove the user and empty rooms from the DTO

        gameServDto.clientsNumber --;
        gameServDto.clientsId = gameServDto.clientsId.filter((id) => id != client.id);
        gameServDto.rooms = gameServDto.rooms.filter((room) => server.sockets.adapter.rooms.get(room.name) != undefined);
        console.log('client ID :' + client.id + "DISCONNECT : ", gameServDto);
    }
}