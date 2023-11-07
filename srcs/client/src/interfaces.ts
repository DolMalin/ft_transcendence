import { Socket } from "socket.io-client";

export interface Paddle {
    width: number;
    height: number;
    x: number;
    y: number;
  }

export interface Ball {
    x : number,
    y : number,
    size : number,
    color : string,
    angle : number,
    speed : number
  }

export interface GameProps {
    gameType : string,
    sock : Socket,
    playerId : string,
    gameRoom : string
}

export interface GameInfo {
    gameType : string,
    playerId : string,
    roomName : string
}