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
    
    
    
    useEffect (function sendStartingInfosToServer() {
        const gameInfo : GameInfo = {
                gameType : props.gameType,
                playerId : props.playerId,
                roomName : props.gameRoom
            }
            sock.emit('gameStart', gameInfo);
            sock.emit('ballMove', gameInfo);
            // sock.emit()
        setStartingInfosSent(true);
        console.log('change');
    }, [startingInfosSent]);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const canvasBounding = canvas.getBoundingClientRect();
        let   paddle = {
            width : canvasBounding.width * 0.15,
            height : canvasBounding.height * 0.02,
            x : canvasBounding.width / 2 - canvasBounding.width * 0.075,
            y : canvasBounding.height,
        };
        let   adversaryPaddle : Paddle = {
            width : canvasBounding.width * 0.15,
            height : canvasBounding.height * 0.02,
            x : canvasBounding.width / 2 - canvasBounding.width * 0.075,
            y : 0,
        };
        let ball : Ball = {
            x : 0.5,
            y : 0.5,
            size : canvasBounding.width * 0.1,
            color : 'white',
            directionalVector : {x : 0, y : 0},
            speed : 0
        }
        
        sock.on('adversaryMoves', (x, y) => {
            adversaryPaddle.x = canvasBounding.width * x;
            adversaryPaddle.y = canvasBounding.height * y;
        });
        sock.on('myMoves', (x, y) => {
            console.log('x : ', x, ' | y : ', y,  ' width :', canvasBounding.width, ' height : ', canvasBounding.height);
            paddle.x = canvasBounding.width * x;
            paddle.y = canvasBounding.height * y;
        })
        sock.on('ballDirection', (directionalVector : {x : number, y : number}, speed : number ) => {

        })
        sock.on('scoreChange', ({x, y}) => {
            // display score
        })
        
        function drawPaddle() {
            context.fillStyle = 'white';
            
            // console.log('my paddle x : ', paddle.x, ' y : ', paddle.y, ' width :', canvasBounding.width, ' height : ', canvasBounding.height);
            context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        }
        function drawAdversaryPaddle() {
            context.fillStyle = 'white';

            // console.log('ennemy paddle x : ', adversaryPaddle.x, ' y : ', adversaryPaddle.y, ' width :', canvasBounding.width, ' height : ', canvasBounding.height);

            context.fillRect(adversaryPaddle.x, adversaryPaddle.y, adversaryPaddle.width, adversaryPaddle.height);
        }
        function drawBoard() {
            context.fillStyle = 'black';
            context.fillRect(0, 0, canvasBounding.width, canvasBounding.height);
        }

        function drawBall() {
            context.fillStyle = ball.color;

            context.beginPath();
            context.arc(ball.x * canvasBounding.width, ball.y * canvasBounding.height, 50, 0, 2 * Math.PI);
            context.stroke();
            console.log(ball.x * canvasBounding.width);
        }

        document.addEventListener("keydown", (event) => {
            const keyname = event.key; 
            switch (keyname)
            {
                // case Constants.UP   :
                // case Constants.DOWN :
                case Constants.LEFT :
                case Constants.RIGHT:
                    console.log('emiting player move | id : ', props.playerId);
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
        // context.fillRect(0, 0, props.width / 0.5, props.height / 2);

        const interval = setInterval(() => {
            update();
        }, Constants.FRAME_RATE);

        return () => {
            sock.off('playerId');
            sock.off('adversaryMove');
            sock.off('ballPosition');
            sock.off('scoreChange');
            sock.off('myMove');
            clearInterval(interval);
        };
    }, []);



    return (<>
    <canvas ref={canvasRef} width={Math.floor(gameZone.clientWidth * 0.8)} height={Math.floor(gameZone.clientHeight * 0.6)} ></canvas>
    </>)
}

export default Game