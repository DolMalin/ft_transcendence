export interface Paddle {
    x : number,
    y : number,
    width : number,
    height : number,
  }
  
  export interface Ball {
    x : number,
    y : number,
    size : number,
    color : string,
    directionalVector : {x : number, y : number},
    speed : number
  }
  
  export interface Game {
    clientOne : string,
    clientTwo : string,
    gameType  : string,
    paddleOne : Paddle,
    paddleTwo : Paddle,
    ball : Ball
  }
  
  export interface GameInfo {
    gameType : string,
    playerId : string,
    roomName : string
  }