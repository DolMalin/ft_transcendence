import React from 'react'
import { useRef, useEffect, useState, KeyboardEvent } from 'react'
import { Socket, io } from 'socket.io-client'
import * as Constants from './const'
import { 
    Box,
    Text,
    Image
    } from '@chakra-ui/react';
import { 
    drawNumbers,
    drawScore,
    drawBall,
    drawPaddle,
    drawAdversaryPaddle,
    drawBoard } from './Draw';
import { 
    Ball,
    Paddle,
    GameInfo,
    GameProps,
    } from './interfaces';


function debounce(func : Function, ms : number) {
    let timer : string | number | NodeJS.Timeout;

    return ( function(...args : any) {
        clearTimeout(timer);
        timer = setTimeout( () => {
            timer = null;
            func.apply(this, args)
        }, ms);
    });
} 
/**
 * @description 
 * props are :
 * - gameType
 * - width
 * - height
*/
function Game(props : GameProps) {
    const canvasRef = useRef(null);
    const gameZone = document.getElementById(Constants.GAME_ZONE);
    const sock : Socket = props.sock;
    const [dimension, setDimension] = useState({
        height : gameZone.clientWidth,
        width : gameZone.clientWidth
    })
    const [midPointCT, setMidPointCT] = useState(0);
    const [midPointCTOn, setMidPointCTOn] = useState(false);
    const [ctSizeModifier, setCtSizeModifier] = useState(1);

    const [playerOneScore, setPlayerOneScore] = useState(0);
    const [playerTwoScore, setPlayerTwoScore] = useState(0);

    const [myPaddle, setMyPaddle] = useState({
        width : Constants.PADDLE_WIDTH,
        height : Constants.PADDLE_HEIGHT,
        x : 0.5 - Constants.PADDLE_WIDTH / 2,
        y : props.playerId === '1' ? 1 - Constants.PADDLE_HEIGHT : 0,
    });

    const [adversaryPaddle, setAdPaddle] = useState({
        width : Constants.PADDLE_WIDTH,
        height :  Constants.PADDLE_HEIGHT,
        x : 0.5 - Constants.PADDLE_WIDTH / 2,
        y : props.playerId === '1' ? 0 : 1 - Constants.PADDLE_HEIGHT,
    });

    // const [canvas, setCanvas] = useState<HTMLCanvasElement>();
    // const [context, setContext] = useState<CanvasRenderingContext2D>();
    // const [canvasBounding, setCanvasBounding] = useState<DOMRect>();

    const gameInfo : GameInfo = {
            gameType : props.gameType,
            playerId : props.playerId,
            roomName : props.gameRoom
        }

    useEffect(() => {
        const debouncedHandleResize = debounce (function handleResize() {

            setDimension({
                height : gameZone.clientWidth,
                width : gameZone.clientWidth
            });
        }, 100);
        console.log('going through resize UE')
        window.addEventListener("resize", debouncedHandleResize);
        return (
            () => {
                window.removeEventListener("resize", debouncedHandleResize)
            }
        )
    }, [dimension])

    useEffect (function sendStartingInfosToServer() {

        if (props.playerId === '1')
            sock.emit('ballMove', gameInfo);
    }, []);

    useEffect( () => {

        // console.log('oppa')
        sock.on('midPointCt', (ct : number) => {
            setMidPointCTOn(true);
            setMidPointCT(ct);
            setCtSizeModifier(1);
        });

        sock.on('midPointCtEnd', () => {
            setMidPointCTOn(false);
            setMidPointCT(0);
            setCtSizeModifier(1);
        });

        return (() => {
            sock.off('midPointCt');
            sock.off('midPointCtEnd');
        })
    }, [midPointCT, midPointCTOn])
    
    useEffect(() => {

        // console.log('RERENDERING')
        const canvas : HTMLCanvasElement = canvasRef.current;
        const context : CanvasRenderingContext2D = canvas.getContext('2d');
        const canvasBounding : DOMRect = canvas.getBoundingClientRect();

        let ball : Ball = {
            x : 0.5,
            y : 0.5,
            size : 0.020,
            color : 'white',
            angle : 0,
            speed : 0
        }
        
        sock.on('adversaryMoves', (paddle : Paddle) => {

            setAdPaddle(paddle);
        });

        sock.on('myMoves', (paddle : Paddle) => {

            setMyPaddle(paddle)
        });

        sock.on('ballInfos', (serverBall : Ball) => {

            ball = serverBall;
        });

        sock.on('pointScored', (playerId, newScore) => {

            if (playerId === 1)
            {
                console.log('1 scored, score : ', newScore)
                setPlayerOneScore(newScore);
            }
            else if (playerId === 2)
            {
                console.log('2 scored, score :', newScore)
                setPlayerTwoScore(newScore);
            }
        });

        function drawMidPointCt() {
            let numberSize = canvasBounding.width / 6 * ctSizeModifier;
            let x = canvasBounding.width / 2 - (numberSize * 0.5)
            let y = canvasBounding.height / 2 - (numberSize * 0.5)
            switch (midPointCT) 
            {
                case 3 :
                    drawNumbers(context, 'white', x, y, numberSize, Constants.THREE);
                    break ;
                case 2 :
                    drawNumbers(context, 'white', x, y, numberSize, Constants.TWO);
                    break ;
                case 1 :
                    drawNumbers(context, 'white', x, y, numberSize, Constants.ONE);
                    break ;
                default :
                    break ;
            }
            setCtSizeModifier((prevState) => {return (prevState - 1 / Constants.FPS)});
        }

        function moveBall() {

            let Vx = ball.speed * Math.cos(ball.angle);
            let Vy = ball.speed * Math.sin(ball.angle)
            
            ball.x += Vx;
            ball.y += Vy;
        }

        function handleKeydown(event : globalThis.KeyboardEvent) {
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
        }

        document.addEventListener("keydown", handleKeydown);

        function update() {
           
            drawBoard(context, canvasBounding);
            
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
            drawAdversaryPaddle(context, canvasBounding, adversaryPaddle);
            drawPaddle(context, canvasBounding, myPaddle);
            moveBall();

            if (midPointCTOn)
                drawMidPointCt();

            else
                drawBall(context, canvasBounding, ball);

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
            document.removeEventListener('keydown', handleKeydown);
        };
    }, [dimension, playerOneScore, playerTwoScore, midPointCT, midPointCTOn, ctSizeModifier, myPaddle, adversaryPaddle]);



    return (<>
        <Box display={'flex'} flexDirection={'column'}>

            <Box display={'flex'} flexDirection={'row'}
                border={'2px solid black'}
                borderTopLeftRadius={'20px'}
                borderTopRightRadius={'20px'}
                background={props.playerId === '2' ? Constants.DARKER_BLUE : Constants.DARKER_RED}
                padding={'2%'}
                height={Math.floor(gameZone.clientWidth * 0.15)}
                width={Math.floor(gameZone.clientWidth * 0.6)}
            >
                <Image borderRadius={'full'} src='https://bit.ly/dan-abramov'></Image>
                <Text> Joueureuse 2 </Text>
            </Box>
            
            <canvas ref={canvasRef} width={Math.floor(gameZone.clientWidth * 0.6)} height={Math.floor(gameZone.clientWidth * 0.8)} ></canvas>
            
            <Box display={'flex'} flexDirection={'row-reverse'}
                border={'2px solid black'}
                borderBottomLeftRadius={'20px'}
                borderBottomRightRadius={'20px'}
                background={props.playerId === '1' ? Constants.DARKER_BLUE : Constants.DARKER_RED}
                padding={'2%'}
                height={Math.floor(gameZone.clientWidth * 0.15)}
                width={Math.floor(gameZone.clientWidth * 0.6)}
            >
                <Image borderRadius={'full'} src='https://bit.ly/dan-abramov'></Image>
                <Text> Joueureuse 1 </Text>
            </Box>

        </Box>
    </>)
}

export default Game