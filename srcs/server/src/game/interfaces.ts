export interface Paddle {
    x : number,
    y : number,
    width : number,
    height : number,
  }
  
  export interface Ball {
    x : number,
    y : number,
    // topLeftX : number,
    // topLeftY : number,
    size : number,
    color : string,
    directionalVector : {x : number, y : number},
    angle : number,
    speed : number
  }
  
  export interface Game {
    clientOne : string,
    clientTwo : string,
    gameType  : string,
    paddleOne : Paddle,
    paddleTwo : Paddle,
    ball : Ball,
    ballRefreshInterval : any
  }
  
  export interface GameInfo {
    gameType : string,
    playerId : string,
    roomName : string
  }