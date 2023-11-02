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
    angle : number,
    speed : number
  }
  
  export interface Game {
    clientOne : string,
    clientTwo : string,
    clientOneScore : number,
    clientTwoScore : number,
    Victor : string,
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