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

function Game(props : any) {
    const canvasRef = useRef(null);

    let   playerId : number;
    let   paddle = {
        width : 10,
        height : 100,
        x : 0,
        y : 300 - 50
    };
    let   adversaryPaddle : Paddle = {
        width : 10,
        height : 100,
        x : 900 - 10,
        y : 300 - 50
    };
    let gameBoard = {
        x : window.innerWidth / 3,
        y : window.innerHeight / 3,
        width : 900,
        height : 600,
        
    }
    
    useEffect(() => {
        const sock : Socket = props.sock;
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // TO DO : Emit event to give canvas info to back and do so everytime the windows is resized
        
        sock.on('playerId', (data) => {
            playerId = data;
        })
        sock.on('adversaryMoves', (x, y) => {
            // move ennemy paddle
            adversaryPaddle.x += x;
            adversaryPaddle.y += y;

            if (adversaryPaddle.x > gameBoard.width - adversaryPaddle.width)
                adversaryPaddle.x = gameBoard.width - adversaryPaddle.width;
            if (adversaryPaddle.y < 0)
                adversaryPaddle.y = 0;
            else if (adversaryPaddle.y > gameBoard.height - adversaryPaddle.height)
                adversaryPaddle.y = gameBoard.height - adversaryPaddle.height;
        });
        sock.on('myMoves', (x, y) => {
            //get new display data from the server for my paddle
            paddle.x += x;
            paddle.y += y;

            if (paddle.x < 0)
                paddle.x = 0;
            if (paddle.y < 0)
                paddle.y = 0;
            else if (paddle.y > gameBoard.height - paddle.height)
                paddle.y = gameBoard.height - paddle.height;
            console.log ('paddle x : ',paddle.x,'paddle.y : ', paddle.y);
            
        })
        sock.on('ballPosition', () => {
            //receive ball pos to display it
        })
        sock.on('scoreChange', () => {
            // display score
        })
        
        function drawPaddle() {
            context.fillStyle = 'white';
            context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        }
        function drawAdversaryPaddle() {
            context.fillStyle = 'white';
            context.fillRect(adversaryPaddle.x, adversaryPaddle.y, adversaryPaddle.width, adversaryPaddle.height);
        }
        function drawBoard() {
            context.fillStyle = 'black';
            context.fillRect(0, 0, 900, 600);
        }

        document.addEventListener("keydown", (event) => {
            const keyname = event.key; 
            switch (keyname)
            {
                case Constants.UP   :
                case Constants.DOWN :
                case Constants.LEFT :
                case Constants.RIGHT:
                    console.log('emiting player move')
                    sock.emit('playerMove', keyname);
                    break ;
                default :
                    break ;
            }
        })
        function update() {
            drawBoard();
            drawAdversaryPaddle();
            drawPaddle();
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

        setInterval(() => {
            update();
        }, Constants.FRAME_RATE);

        return () => {
            sock.off('playerId');
            sock.off('adversaryMove');
            sock.off('ballPosition');
            sock.off('scoreChange');
            sock.off('myMove');
        };
    }, []);



    return (<>
    <canvas ref={canvasRef} width={900} height={600} > feur </canvas>
    </>)
}

export default Game