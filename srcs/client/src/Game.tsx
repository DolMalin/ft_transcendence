import React from 'react'
import { useRef, useEffect, useState, KeyboardEvent } from 'react'
import { Socket, io } from 'socket.io-client'
import { Stage, Layer, Rect, Text } from 'react-konva';
import * as Constants from './const'
import { useAnimationFrame } from 'framer-motion';

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


function DrawNumbers(context : CanvasRenderingContext2D, color : string,x : number, y : number, size : number, number : number[]) {

    let height = size;
    let width = size / 2;
    let Spacing  = height / 10;
    let rodWidth  = size / 10;
    let HorizontalRodLenght = size / 2;
    let VerticalRodLenght = size / 2 - Spacing * 2;

    if (number === Constants.ONE)
    {
        x += width / 2 + rodWidth / 2;
    }

    context.fillStyle = color;
    number.forEach((value, index) => {
        switch (value)
        {
            case 1 :
                context.fillRect(x + Spacing, y, HorizontalRodLenght, rodWidth)
                break ;

            case 2 :
                context.fillRect(x, y + Spacing, rodWidth, VerticalRodLenght)
                break ;
                
            case 3 :
                context.fillRect(x + width + Spacing, y + Spacing, rodWidth, VerticalRodLenght)
                break ;

            case 4 :
                context.fillRect(x + Spacing, y + height / 2 - Spacing, HorizontalRodLenght, rodWidth)
                break ;

            case 5 :
                context.fillRect(x, y + height / 2, rodWidth, VerticalRodLenght);
                break ;

            case 6 :
                context.fillRect(x + width + Spacing, y + height / 2, rodWidth, VerticalRodLenght);
                break ;

            case 7 :
                context.fillRect(x + Spacing, y + height - Spacing * 2, HorizontalRodLenght, rodWidth);
                break ;

            default :
                break ;
        }
    })
    
    // TO DO : Add triangle edges for a smoother rendering if times is not of the matter
};

function drawScore(playerScores : number, side : string, color : string, context : CanvasRenderingContext2D ,canvasBounding : DOMRect) {
    
    let numberSize = canvasBounding.width / 5;
    let y : number;
    let x = canvasBounding.width / 2 - numberSize * 0.5;
    
    if (side === "top")
        y = 0.25 * canvasBounding.height - numberSize * 0.5;
    if (side === "bottom")
        y = 0.75 * canvasBounding.height - numberSize * 0.5;

    switch (playerScores) {
        case 0 :
            DrawNumbers(context, color, x, y, numberSize, Constants.ZERO);
            break ;
        case 1 :
            DrawNumbers(context, color, x, y, numberSize, Constants.ONE);
            break ;
        case 2 :
            DrawNumbers(context, color, x, y, numberSize, Constants.TWO);
            break ;
        case 3 :
            DrawNumbers(context, color, x, y, numberSize, Constants.THREE);
            break ;
        case 4 :
            DrawNumbers(context, color, x, y, numberSize, Constants.FOUR);
            break ;
        case 5 :
            DrawNumbers(context, color, x, y, numberSize, Constants.FIVE);
            break ;
        case 6 :
            DrawNumbers(context, color, x, y, numberSize, Constants.SIX);
            break ;
        case 7 :
            DrawNumbers(context, color, x, y, numberSize, Constants.SEVEN);
            break ;
        case 8 :
            DrawNumbers(context, color, x, y, numberSize, Constants.EIGHT);
            break ;
        case 9 :
            DrawNumbers(context, color, x, y, numberSize, Constants.NINE);
            break ;
        default :
            break ;
    }
}
  

function Game(props : GameProps) {
    const canvasRef = useRef(null);
    const sock : Socket = props.sock;
    const [startingInfosSent, setStartingInfosSent] = useState(false);

    let midPointCT = 0;
    let midPointCTOn = false;
    let ctSizeModifier = 1;
    let playerOneScore = 0;
    let playerTwoScore = 0;

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

    useEffect( () => {

        sock.on('midPointCt', (ct : number) => {
            midPointCTOn = true;
            midPointCT = ct;
            ctSizeModifier = 1;
        });

        sock.on('midPointCtEnd', () => {
            console.log('END');
            midPointCTOn = false;
            midPointCT = 0;
            ctSizeModifier = 1;
        });

        return (() => {
            sock.off('midPointCt');
            sock.off('midPointCtEnd');
        })
    }, [midPointCT, midPointCTOn])
    
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

        adversaryPaddle.x = canvasBounding.width * x;
        adversaryPaddle.y = canvasBounding.height * y;
        });

        sock.on('myMoves', (x, y) => {

            paddle.x = canvasBounding.width * x;
            paddle.y = canvasBounding.height * y;
        });

        sock.on('ballInfos', (serverBall : Ball) => {
            ball = serverBall;

            // console.log("BALL MOVE TRIGGERED SPEED :", ball.speed)
        });

        sock.on('pointScored', (playerId, newScore) => {

            if (playerId === 1)
                playerOneScore = newScore;
            else if (playerId === 2)
                playerTwoScore = newScore;
                
            console.log('point scored')
            // TO DO display timer
        });
        
        function DrawMidPointCt() {
            let numberSize = canvasBounding.width / 6 * ctSizeModifier;
            let x = canvasBounding.width / 2 - (numberSize * 0.5)
            let y = canvasBounding.height / 2 - (numberSize * 0.5)
            switch (midPointCT) 
            {
                case 3 :
                    DrawNumbers(context, 'white', x, y, numberSize, Constants.THREE);
                    break ;
                case 2 :
                    DrawNumbers(context, 'white', x, y, numberSize, Constants.TWO);
                    break ;
                case 1 :
                    DrawNumbers(context, 'white', x, y, numberSize, Constants.ONE);
                    break ;
                default :
                    break ;
            }
            ctSizeModifier -= 1 / 60;
        }

        function drawPaddle() {
            context.fillStyle = Constants.BLUE;
            
            context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        }
        function drawAdversaryPaddle() {
            context.fillStyle = Constants.RED;

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

            if (props.playerId === '1')
            {
                drawScore(playerOneScore, 'bottom', Constants.LIGHT_BLUE, context, canvasBounding);
                drawScore(playerTwoScore, 'top', Constants.LIGHT_RED, context, canvasBounding);
            }

            else if (props.playerId === '2')
            {
                drawScore(playerOneScore, 'bottom', Constants.LIGHT_RED, context, canvasBounding);
                drawScore(playerTwoScore, 'top', Constants.LIGHT_BLUE, context, canvasBounding);
            }
            // moveBall();

            if (midPointCTOn)
                DrawMidPointCt();

            else
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