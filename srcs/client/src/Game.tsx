import React from 'react'
import { useRef, useEffect, useState, KeyboardEvent } from 'react'
import { Socket, io } from 'socket.io-client'
import { Stage, Layer, Rect, Text } from 'react-konva';
import * as Constants from './const'

/**
 * @description 
 * props are :
 * - gameType
 * - width
 * - height
*/
interface Paddle {
    width: number;
    height: number;
    x: number;
    y: number;
  }

  interface Ball {
    x : number,
    y : number,
    size : number,
    color : string,
    directionalVector : {x : number, y : number},
    angle : number,
    speed : number
  }

interface GameProps {
    gameType : string,
    sock : Socket,
    playerId : string,
    gameRoom : string
}

interface GameInfo {
    gameType : string,
    playerId : string,
    roomName : string
}

function Game(props : GameProps) {
    const canvasRef = useRef(null);
    const sock : Socket = props.sock;
    const [startingInfosSent, setStartingInfosSent] = useState(false);
    const gameZone = document.getElementById(Constants.GAME_ZONE);
    const gameInfo : GameInfo = {
            gameType : props.gameType,
            playerId : props.playerId,
            roomName : props.gameRoom
        }
    
    
    
    useEffect (function sendStartingInfosToServer() {
            sock.emit('gameStart', gameInfo);
            if (props.playerId === '1')
            {
                console.log('emit ball move');
                sock.emit('ballMove', gameInfo);
            }
            // sock.emit()
        setStartingInfosSent(true);
    }, []);
    
    useEffect(() => {

        console.log("client ID : ", props.playerId);
        const canvas : HTMLCanvasElement = canvasRef.current;
        const context : CanvasRenderingContext2D = canvas.getContext('2d');
        const canvasBounding = canvas.getBoundingClientRect();
        let   paddle = {
            width : canvasBounding.width * 0.20,
            height : canvasBounding.height * 0.02,
            x : canvasBounding.width / 2 - canvasBounding.width * 0.075,
            y : canvasBounding.height,
        };
        let   adversaryPaddle : Paddle = {
            width : canvasBounding.width * 0.20,
            height : canvasBounding.height * 0.02,
            x : canvasBounding.width / 2 - canvasBounding.width * 0.075,
            y : 0,
        };
        let ball : Ball = {
            x : 0.5,
            y : 0.5,
            size : 0.020,
            color : 'white',
            directionalVector : {x : 0, y : 0},
            angle : 0,
            speed : 0
        }
        
        sock.on('adversaryMoves', (x, y) => {
            // x = 1 - x - 0.15;
            // y = 0;
            adversaryPaddle.x = canvasBounding.width * x;
            adversaryPaddle.y = canvasBounding.height * y;
        });

        sock.on('myMoves', (x, y) => {
            // if (props.playerId === '2')
            // {
                // x = 1 - x;
            //     y = 1 - 0.02;
            // }
            paddle.x = canvasBounding.width * x;
            paddle.y = canvasBounding.height * y;
        });

        sock.on('ballInfos', (serverBall : Ball) => {
            ball = serverBall;
            // if (props.playerId === '2')
            // {
            //     ball.x = 1 - ball.x;
            //     ball.y = 1 - ball.y;
            // }
            console.log("BALL MOVE TRIGGERED SPEED :", ball.speed)
        });

        sock.on('scoreChange', ({x, y}) => {
            // display score
        });

        sock.on('pointScored', () => {
            console.log('point scored')
            // TO DO display timer
        });
        
        function drawPaddle() {
            context.fillStyle = 'blue';
            
            context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        }
        function drawAdversaryPaddle() {
            context.fillStyle = 'red';

            context.fillRect(adversaryPaddle.x, adversaryPaddle.y, adversaryPaddle.width, adversaryPaddle.height);
        }
        function drawBoard() {
            context.fillStyle = 'black';

            context.fillRect(0, 0, canvasBounding.width, canvasBounding.height);
        }

        function drawBall() {
            context.fillStyle = ball.color;

            context.beginPath();
            context.arc(ball.x * canvasBounding.width, ball.y * canvasBounding.height, canvasBounding.width * ball.size, 0, 2 * Math.PI);
            context.stroke();
            context.fill();
        }

        function moveBall() {

            let Vx = ball.speed * Math.cos(ball.angle);
            let Vy = ball.speed * Math.sin(ball.angle)
            
            ball.x += Vx;
            ball.y += Vy;

            // if (props.playerId === '2')
            // {
            //     ball.x = 1 - ball.x;
            //     ball.y = 1 - ball.y;
            // }

            if (ball.x > 1)
            {
                ball.x = 1;
                if (ball.angle > 180)
                    ball.angle -= 180;
                else
                    ball.angle += 180
            }
            if (ball.x < 0)
            {
                ball.x = 0;
                if (ball.angle > 180)
                    ball.angle -= 180;
                else
                    ball.angle += 180
            }
            // if (ball.y > 1)
            // {
            //     ball.y = 1;
            //     if (ball.angle > 180)
            //         ball.angle -= 180;
            //     else
            //         ball.angle += 180
            // }
            // if (ball.y < 0)
            // {
            //     ball.y = 0;
            //     if (ball.angle > 180)
            //         ball.angle -= 180;
            //     else
            //         ball.angle += 180
            // }
            // console.log(ball.angle);
        }

        document.addEventListener("keydown", (event) => {
            const keyname = event.key; 
            switch (keyname)
            {
                case Constants.LEFT :
                case Constants.RIGHT:
                    sock.emit('playerMove', {key : keyname, playerId : props.playerId,room : props.gameRoom});
                    break ;
                default :
                    break ;
            }
        })

        function update() {
            drawBoard();
            drawAdversaryPaddle();
            drawPaddle();
            // moveBall();
            drawBall();
        }
      
        switch (props.gameType)
        {
            case Constants.GAME_TYPE_ONE :
                context.fillStyle = 'red';
                break;
            case Constants.GAME_TYPE_TWO :
                context.fillStyle = 'green';
                break;
            case Constants.GAME_TYPE_THREE :
                context.fillStyle = 'blue';
                break;
            default :
                context.fillStyle = 'pink';
                break ;
        }

        const interval = setInterval(() => {
            update();
        }, Constants.FRAME_RATE);

        return () => {
            sock.off('playerId');
            sock.off('adversaryMove');
            sock.off('ballPosition');
            sock.off('scoreChange');
            sock.off('myMove');
            sock.off('ballInfos');
            clearInterval(interval);
        };
    }, []);



    return (<>
    <canvas ref={canvasRef} width={Math.floor(gameZone.clientWidth * 0.8)} height={Math.floor(gameZone.clientHeight * 0.6)} ></canvas>
    </>)
}

export default Game