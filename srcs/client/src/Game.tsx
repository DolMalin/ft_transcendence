import React from 'react'
import { useRef, useEffect, useState, KeyboardEvent } from 'react'
import { Socket, io } from 'socket.io-client'
import { Stage, Layer, Rect, Text } from 'react-konva';

const GAME_TYPE_ONE = "1";
const GAME_TYPE_TWO = "2";
const GAME_TYPE_THREE = "3";
const FPS = 60;
const FRAME_RATE = 1000 / FPS;
let DOWN = 's';
let UP = 'w';
let LEFT = 'a';
let RIGHT = 'd';




/**
 * @description 
 * props are :
 * - gameType
 * - width
 * - height
*/

function Game(props : any) {
    const canvasRef = useRef(null);
    const [gamePaused, setPause] = useState(true);
    let   playerId : number;
    let   paddle = {
        x : 0,
        y : 300
    };
    let   adversaryPaddle = {
        x : 890,
        y : 300
    };
    // let gameBoard = {
    //     width :
    // }

    useEffect(() => {
        const sock : Socket = props.sock;
        console.log(props.gameType)
        // sock.emit('createGame', props.gameType)
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        sock.on('playerId', (data) => {
            playerId = data;
        })
        sock.on('adversaryMoves', (x, y) => {
            // move ennemy paddle
            console.log(adversaryPaddle.x,' | ', adversaryPaddle.y)
            adversaryPaddle.x += x;
            adversaryPaddle.y += y;
        });
        sock.on('myMoves', (x, y) => {
            //get new display data from the server for my paddle
            paddle.x += x;
            paddle.y += y;
            // if (paddle.x)
        })
        sock.on('ballPosition', () => {
            //receive ball pos to display it
        })
        sock.on('scoreChange', () => {
            // display score
        })
        
        function drawPaddle() {
            context.fillStyle = 'white';
            context.fillRect(paddle.x, paddle.y, 10, 100);
        }
        function drawAdversaryPaddle() {
            context.fillStyle = 'white';
            context.fillRect(adversaryPaddle.x, adversaryPaddle.y, 10, 100);
        }
        function drawBoard() {
            context.fillStyle = 'black';
            context.fillRect(0, 0, 900, 600);
        }

        document.addEventListener("keydown", (event) => {
            const keyname = event.key; 
            switch (keyname)
            {
                case UP   :
                case DOWN :
                case LEFT :
                case RIGHT:
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
            case GAME_TYPE_ONE :
                context.fillStyle = 'red';
                break;
            case GAME_TYPE_TWO :
                context.fillStyle = 'green';
                break;
            case GAME_TYPE_THREE :
                context.fillStyle = 'blue';
                break;
            default :
                context.fillStyle = 'pink';
                break ;
        }
        // context.fillRect(0, 0, props.width / 0.5, props.height / 2);

        setInterval(() => {
            update();
        }, FRAME_RATE);

        return () => {
            sock.off('playerId');
            sock.off('adversaryMove');
            sock.off('ballPosition');
            sock.off('scoreChange');
            sock.off('myMove');
        };
    }, []);



    return (<>
    <canvas ref={canvasRef} width={900} height={600}> feur </canvas>
    </>)
}

export default Game