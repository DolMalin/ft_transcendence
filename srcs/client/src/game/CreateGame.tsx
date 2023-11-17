import React, { useCallback } from 'react';
import { useRef, useEffect, useState } from 'react';
import 'reactjs-popup/dist/index.css';
import {
    Button,
    Radio,
    RadioGroup,
    CloseButton,
    Stack,
    Text, 
    Box
    } from '@chakra-ui/react';
import Game from './Game';
import { Socket, io } from 'socket.io-client';
import * as Constants from './const';
import { GameInfo } from './interfaces';

function CreateGameButton(props : any) {
    const buttonRef = useRef(null);
    const [playButtonVisible, setPlayButtonVisible] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [gameVisible, setGameVisible] = useState(false);
    const [selectedGameType, setSelectedGameType] = useState('');
    const [WaitingScreenVisible, setWaitingScreenVisible] = useState (false);
    const [preGameCDVisible, setPreGameCDVisible] = useState(false);
    const [preGameCD, setPreGameCD] = useState(Constants.LAUNCH_CD);
    const [playerId, setPlayerId] = useState("1");
    const [gameRoom, setGameRoom] = useState('');
    const [lookingForGame, setLookingForGame] = useState(false);
    const [looseScreenVisible, setLooseScreenVisible] = useState(false);
    const [VictoryScreenVisible, setVictoryScreenVisible] = useState(false);

    const sock : Socket = props.sock;
    
    const toggleForm = () => {
        if(formVisible == false)
        {
            setPlayButtonVisible(false);
            setFormVisible(true);
        }
        else
        {
            setFormVisible(false);
            setSelectedGameType('');
            if (!gameVisible)
                setPlayButtonVisible(true);
        }
    }
    
    const toggleGame = (toggle : boolean) => {
        
        setLookingForGame(false);
        if (toggle === false)
        {
            const tmp : GameInfo = {
                gameType : selectedGameType, 
                playerId : playerId, 
                roomName : gameRoom
            }
            sock.emit('leaveGame', tmp);
            setGameVisible(false);
            setPlayButtonVisible(true);
        }
        else
        {
            setGameVisible(true);
            setFormVisible(false);
            setPlayButtonVisible(false);
        }
    }

    useEffect (function matchMaking() {
        if (lookingForGame === true)
        {
            sock.emit("joinGame", selectedGameType);
            setFormVisible(false);
            setWaitingScreenVisible(true);

            sock.on('roomFilled', () => {

                setWaitingScreenVisible(false);
                setPreGameCDVisible(true);
            })

            sock.on('playerId', (side) => {

                setPlayerId(side);
            })

            sock.on('roomName', (roomName) => {

                setGameRoom(roomName);
            })

            return (() => {
                sock.off('roomFilled');
                sock.off('roomName');
                sock.off('playerId');
            })
        }
    }, [lookingForGame])

    useEffect(() => {
        sock.on('gameOver', (winner : string) => {
            if (sock.id === winner)
                setVictoryScreenVisible(true)
            else
                setLooseScreenVisible(true)

            setGameVisible(false);
        });


        return (() => {
            sock.off('gameOver');
        })
    }, [gameVisible, VictoryScreenVisible, looseScreenVisible])

    function WaitingScreen() {
        
        function leaveQueue() {
            setLookingForGame(false);
            sock.emit('leaveQueue', gameRoom);
            setWaitingScreenVisible(false);
            setPlayButtonVisible(true);
        }

        const [dot, setDot] = useState('.');
        useEffect(() => {
            const dotdotdot = setInterval(() => {
              switch (dot) {
                case '.':
                  setDot('..');
                  break;
                case '..':
                  setDot('...');
                  break;
                case '...':
                  setDot('.');
                  break;
                default:
                  break;
              }
            }, 1000);
        
            return () => clearInterval(dotdotdot);
        }, [dot]);

        useEffect(() => {
            function handleUnload() {
                leaveQueue();
                setSelectedGameType('');
            }

            window.addEventListener('beforeunload', handleUnload);
            return (() => {window.removeEventListener('beforeunload', handleUnload)})
        }, [])
        return (
        <Box className='waitingScreen'>
            <Text fontSize="2xl" textAlign="center" style={{display : 'flex', flexDirection: 'row'}}>
                Looking for game {dot}
            </Text>
            <Button onClick={leaveQueue} > Leave Queue</Button>
        </Box>
        )
    }
    
    function WaitingForLaunch() {

        useEffect(() => {
            const timer = setInterval(() => {
                setPreGameCD((prevCd) => (prevCd > 0 ? prevCd - 1 : 0));
                if (preGameCD === 0)
                {
                    setPreGameCD(Constants.LAUNCH_CD);
                    setPreGameCDVisible(false);
                    toggleGame(true);
                    return ;
                }
            }, 1000);
            return () => clearInterval(timer);
        }, []);
        return(
            <Box className='waitingScreen'>
                <Text fontSize="2xl" textAlign="center"> GAME LAUNCH IN {preGameCD} !!!</Text>
            </Box>
        )
    }

    function LooseScreen () {
    // Display new ladder placement
        function closeVScreen() {
            setLooseScreenVisible(false);
            setPlayButtonVisible(true);
        };

        return (<>
            <Box className='waitingScreen'>
                <CloseButton onClick={closeVScreen} alignItems={'right'}></CloseButton>
                <Text> YOU LOST MICHEL </Text>
            </Box>
        </>)
    }

    function VictoryScreen () {
    // Display new ladder placement
        function closeVScreen() {
            setVictoryScreenVisible(false);
            setPlayButtonVisible(true);
        };
        
        return (<>
            <Box className='waitingScreen'>
                <CloseButton onClick={closeVScreen} alignItems={'right'}></CloseButton>
                <Text> YOU WON MICHEL </Text>
            </Box>
        </>)
    }
    
    function Form() {

        const [disabledButton, setDisabledButton] = useState(true);

        useEffect(() => {
            if (selectedGameType != '')
                setDisabledButton(false);
            else
                setDisabledButton(true);
            
        }, [selectedGameType]);

        return(
            <RadioGroup borderWidth={'2px'} 
                borderColor={'blackAlpha.500'} 
                borderStyle={'solid'}
                padding={10}
                backgroundColor={'pink.100'}
                onChange={setSelectedGameType}
                value={selectedGameType}>
                <CloseButton onClick={toggleForm} alignItems={'right'}></CloseButton>
                <Stack direction='column'>
                    <Radio value={Constants.GAME_TYPE_ONE}> {Constants.GAME_TYPE_ONE} </Radio>
                    <Radio value={Constants.GAME_TYPE_TWO}> {Constants.GAME_TYPE_TWO} </Radio>
                    <Radio value={Constants.GAME_TYPE_THREE}> {Constants.GAME_TYPE_THREE} </Radio>
    
                    <Button as={'button'} onClick={() => {setLookingForGame(true)}} alignItems={'center'} isDisabled={disabledButton}> Launch {selectedGameType} </Button>
                </Stack>
            </RadioGroup>
        );
    }
    
    return (<>
        {playButtonVisible && <Button onClick={toggleForm}> Play</Button>}
        {formVisible && <Form />}
        {WaitingScreenVisible && <WaitingScreen />}
        {preGameCDVisible && <WaitingForLaunch />}
        {gameVisible && <Game gameType={selectedGameType} sock={sock} playerId={playerId} gameRoom={gameRoom}/>}
        {/* {gameVisible && <Button onClick={() => {toggleGame(false)}}> Leave </Button>} */}
        {VictoryScreenVisible && <VictoryScreen />}
        {looseScreenVisible && <LooseScreen />}
    </>);
}

export default CreateGameButton;