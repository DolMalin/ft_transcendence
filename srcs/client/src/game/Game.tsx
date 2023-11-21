import React from 'react'
import { useRef, useEffect, useState } from 'react'
import { Socket, io } from 'socket.io-client'
import * as Constants from './const'
import { 
    Box,
    Text,
    Avatar,
    Flex,
    WrapItem
    } from '@chakra-ui/react';
import { 
    drawScore,
    drawBall,
    drawPaddle,
    drawAdversaryPaddle,
    drawMidPointCt,
    drawBoard } from './Draw';
import { 
    GameInfo,
    GameProps,
    GameMetrics
    } from './interfaces';

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
        height : gameZone.clientWidth <= gameZone.clientHeight ? gameZone.clientWidth : gameZone.clientHeight,
        width : gameZone.clientWidth <= gameZone.clientHeight ? gameZone.clientWidth : gameZone.clientHeight
    })
    const [midPointCT, setMidPointCT] = useState(0);
    const [midPointCTOn, setMidPointCTOn] = useState(false);
    const [ctSizeModifier, setCtSizeModifier] = useState(1);

    const [playerOneScore, setPlayerOneScore] = useState(0);
    const [playerTwoScore, setPlayerTwoScore] = useState(0);

    const [gameMetrics, setGameMetrics] = useState<GameMetrics>({
        paddleOne : {
            x : 0.5 - Constants.PADDLE_WIDTH / 2,
            y : props.playerId === '1' ? 1 - Constants.PADDLE_HEIGHT : 0,
            movingLeft : false,
            movingRight : false,
            speed : Constants.PADDLE_SPEED,
            width : props.gameType === Constants.GAME_TYPE_TWO ? Constants.PADDLE_WIDTH * 2: Constants.PADDLE_WIDTH,
            height : Constants.PADDLE_HEIGHT,
            hitCount : 0,
        },
        paddleTwo :
        {
            x : 0.5 - Constants.PADDLE_WIDTH / 2,
            y : props.playerId === '1' ? 0 : 1 - Constants.PADDLE_HEIGHT,
            movingLeft : false,
            movingRight : false,
            speed : Constants.PADDLE_SPEED,
            width : props.gameType === Constants.GAME_TYPE_TWO ? Constants.PADDLE_WIDTH * 2: Constants.PADDLE_WIDTH,
            height :  Constants.PADDLE_HEIGHT,
            hitCount : 0,
        },
        ball : {
            x : 0.5,
            y : 0.5,
            size : 0.020,
            color : 'white',
            angle : 0,
            speed : 0
        }
    });

    const gameInfo : GameInfo = {
            gameType : props.gameType,
            playerId : props.playerId,
            roomName : props.gameRoom
        }

    useEffect(function resizeEvents() {

        /**
         * @description 
         * temperate the usage of a function in a useEffect and only call it once every X millisecond (ms)
        */
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

        const debouncedHandleResize = debounce (function handleResize() {
            
            if (gameZone.clientWidth < gameZone.clientHeight)
            {
                setDimension({
                    height : gameZone.clientWidth,
                    width : gameZone.clientWidth
                });
            }
            else 
            {
                setDimension({
                    height : gameZone.clientHeight,
                    width : gameZone.clientHeight
                });
            }
        }, 100);

        window.addEventListener("resize", debouncedHandleResize);
        return (
            () => {
                window.removeEventListener("resize", debouncedHandleResize)
            }
        )
    }, [dimension])

    useEffect (function startUp() {

        function handleKeydown(event : globalThis.KeyboardEvent) {

            switch (event.key)
            {
                case Constants.LEFT :
                case Constants.RIGHT:
                    sock.emit('playerMove', {key : event.key, playerId : props.playerId,room : props.gameRoom});
                    break ;
                default :
                    break ;
            }
        }

        function handleKeyup(event : globalThis.KeyboardEvent) {

            switch (event.key)
            {
                case Constants.LEFT :
                    case Constants.RIGHT:
                        sock.emit('playerMoveStopped', {key : event.key, playerId : props.playerId,room : props.gameRoom});
                        break ;
                    default :
                        break ;
            }
        }

        function leaveGameOnRefresh() {
            try {
                sock.emit('leaveGame', gameInfo);
            } catch (e) {
                alert(e.message);
            }
        }

        document.addEventListener("keydown", handleKeydown);
        document.addEventListener("keyup", handleKeyup);
        window.addEventListener("beforeunload", leaveGameOnRefresh);

        if (props.playerId === '1')
            sock.emit('startGameLoop', gameInfo);
        return (() => {
            document.removeEventListener('keydown', handleKeydown);
            document.removeEventListener('keyup', handleKeyup);
            window.removeEventListener("beforeunload", leaveGameOnRefresh)
        })
    }, []);
    
    useEffect(() => {

        const canvas : HTMLCanvasElement = canvasRef.current;
        const context : CanvasRenderingContext2D = canvas.getContext('2d');
        const canvasBounding : DOMRect = canvas.getBoundingClientRect();

        sock.on('pointScored', (playerId, newScore) => {

            if (playerId === 1)
                setPlayerOneScore(newScore);
            else if (playerId === 2)
                setPlayerTwoScore(newScore);
        });

        sock.on('gameMetrics', (pOneMetrics : GameMetrics, pTwoMetrics : GameMetrics) => {
            
            if(props.playerId === '1')
                setGameMetrics(pOneMetrics);
            else if(props.playerId === '2')
                setGameMetrics(pTwoMetrics);
            setCtSizeModifier((prevState) => {return (prevState - 1 / Constants.FPS)});
        });

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

        sock.on('gameOver', () => {
            console.log('leaving ?')
            sock.emit('leaveGame', gameInfo);
        })
        
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
            drawAdversaryPaddle(context, canvasBounding, gameMetrics.paddleTwo);
            drawPaddle(context, canvasBounding, gameMetrics.paddleOne);
            
            if (midPointCTOn && playerOneScore < Constants.SCORE_TO_REACH && playerTwoScore < Constants.SCORE_TO_REACH)
                drawMidPointCt(context, canvasBounding, ctSizeModifier, midPointCT);
            
            else
                drawBall(context, canvasBounding, gameMetrics.ball);

        }
            
        update();

        return () => {
            sock.off('scoreChange');
            sock.off('midPointCt');
            sock.off('midPointCtEnd');
            sock.off('gameMetrics');
        };
    }, [dimension, playerOneScore, playerTwoScore, midPointCT, midPointCTOn, ctSizeModifier, gameMetrics]);


    return (<>
        <Flex flexDir={'column'} textColor={'white'} fontSize={'1em'}>

            <Box display={'flex'} flexDirection={'row'}
                height={dimension.height * 0.08}
                width={dimension.width * 0.6}
            >
                <WrapItem>
                    <Avatar
                    size='full'
                    name='Silvester Staline'
                    src='https://bit.ly/prosper-baba'
                    />{' '}
                </WrapItem>
                <Text
                size='xs'
                > Joueureuse 2 </Text>
            </Box>
            
            <Box borderLeft={'2px solid white'} borderRight={'2px solid white'}>
                <canvas ref={canvasRef} width={dimension.width * 0.6} height={dimension.height * 0.8} ></canvas>
            </Box>
            
            <Box display={'flex'} flexDirection={'row-reverse'}
                height={dimension.height * 0.08}
                width={dimension.width * 0.6}
            >
                <WrapItem>
                    <Avatar
                    size='full'
                    name='Thomas Sankara'
                    src='https://bit.ly/dan-abramov'
                    />{' '}
                </WrapItem>
                <Text> &name </Text>
            </Box>

        </Flex>
    </>)
}

export default Game