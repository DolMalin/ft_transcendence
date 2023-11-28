import { Socket } from "socket.io-client";

export interface Paddle {
  x : number,
  y : number,
  movingLeft : boolean,
  movingRight : boolean,
  speed : number,
  width : number,
  height : number,
  hitCount : number
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

export interface GameMetrics {
  paddleOne : Paddle,
  paddleTwo : Paddle,
  ball : Ball,
}

export interface Avatar {
  id : string,
  filename : string
  data : Uint8Array
}

export interface leaderboardStats {

  username: string
  id : string
  winsAmount: number
  loosesAmount: number
  WLRatio : number
}