import React from 'react';
import { useRef, useEffect, useState } from 'react';
import 'reactjs-popup/dist/index.css';
import { ChakraProvider,
Button,
ButtonGroup,
Radio,
RadioGroup,
CloseButton,
Stack,
Spinner,
defineStyle,
defineStyleConfig,
Text } from '@chakra-ui/react';
import Game from './Game';
import { Socket, io } from 'socket.io-client';
import * as Constants from './const';

const xxl = defineStyle({
    height: 100,
    width: 100,
  });
  export const spinnerTheme = defineStyleConfig({
    sizes: { xxl },
  })

function CreateGameButton(props : any) {
    const buttonRef = useRef(null);
    const [playButtonVisible, setPlayButtonVisible] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [gameVisible, setGameVisible] = useState(false);
    const [selectedGameType, setSelectedGameType] = useState('');
    const [WaitingScreenVisible, setWaitingScreenVisible] = useState (false);
    const [preGameCDVisible, setPreGameCDVisible] = useState(false);
    const [preGameCD, setPreGameCD] = useState(Constants.LAUNCH_CD);
    const [playerSide, setPlayerSide] = useState("left");
    const [gameRoom, setGameRoom] = useState('');

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
            if (!gameVisible)
                setPlayButtonVisible(true);
        }
    }
    
    const toggleGame = () => {
        if (gameVisible)
        {
            sock.emit('leaveGame', undefined);
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

    async function handleMatchmaking (gameType : string) {
        if (gameType.length != 0)
        {
            sock.emit("joinGame", selectedGameType);
            setFormVisible(false);
            setWaitingScreenVisible(true);
            sock.on('roomFilled', () => {
                setWaitingScreenVisible(false);
                setPreGameCDVisible(true);
            })
            sock.on('playerSide', (side) => {
                setPlayerSide(side);
            })
            sock.on('roomName', (roomName) => {
                setGameRoom(roomName);
            })
            return (() => {
                sock.off('roomFilled');
                sock.off('roomName');
                sock.off('playerSide');
            })
        }
    }

    function WaitingScreen() {
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
        
            return () => clearInterval(dotdotdot); // Clear the interval on unmount
          }, [dot]);
        return (
            <Text fontSize="2xl" textAlign="center" style={{display : 'flex', flexDirection: 'row'}}>
                Looking for game {dot}
            </Text>
        )
    }

    function WaitingForLaunch() {
        const countdownInterval = setInterval(() => {
            if (preGameCD > 0) {
                setPreGameCD(preGameCD - 1);
            } else {
                setPreGameCDVisible(false);
                clearInterval(countdownInterval);
                toggleGame();
            }
        }, 1000);
        return(
            <div className='waitingScreen'>
                 <Text fontSize="2xl" textAlign="center" >GAME LAUNCH IN {preGameCD} !!!</Text>
            </div>
        )
    }
    
    function Form() {
        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedGameType(event.target.value);
    };
    
    return(
            <RadioGroup borderWidth={'2px'} 
                borderColor={'blackAlpha.500'} 
                borderStyle={'solid'}
                padding={10}
                backgroundColor={'pink.100'}>
                <CloseButton onClick={toggleForm} alignItems={'right'}></CloseButton>
                <Stack direction='column'>
                    <Radio value='1' checked={selectedGameType === '1'} onChange={handleChange}> type de game 1 </Radio>
                    <Radio value='2' checked={selectedGameType === '2'} onChange={handleChange}> type de game 2 </Radio>
                    <Radio value='3' checked={selectedGameType === '3'} onChange={handleChange}> type de game 3 </Radio>
    
                    <Button onClick={() => handleMatchmaking(selectedGameType)} alignItems={'center'}> Launch {selectedGameType} </Button>
                </Stack>
            </RadioGroup>
        );
    }
    
    return (<>
        {playButtonVisible && <Button onClick={toggleForm}> Play</Button>}
        {formVisible && <Form />}
        {WaitingScreenVisible && <WaitingScreen />}
        {preGameCDVisible && <WaitingForLaunch />}
        {gameVisible && <Game gameType={selectedGameType} sock={sock} playerSide={playerSide} gameRoom={gameRoom}/>}
        {gameVisible && <Button onClick={toggleGame}> Leave </Button>}
    </>);
}

export default CreateGameButton;