import React, { useCallback } from 'react';
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
            console.log('FEUR');
            sock.emit('leaveGame', gameRoom);
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
                console.log('Pathing through room filles callback')
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
    }

    function WaitingScreen() {
        const [dot, setDot] = useState('.');
        useEffect(() => {
            console.log('waitingScreen Use effect')
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
    
    let cd = 5;
    function WaitingForLaunch() {
        

        useEffect(() => {
            const timer = setInterval(() => {
                setPreGameCD((prevCd) => (prevCd > 0 ? prevCd - 1 : 0));
                console.log('cd : ',preGameCD)
                if (preGameCD === 0)
                {
                    setPreGameCDVisible(false);
                    toggleGame();
                    return ;
                }
            }, 1000);
            return () => clearInterval(timer);
        }, []);
        return(
            <div className='waitingScreen'>
                <Text fontSize="2xl" textAlign="center"> GAME LAUNCH IN {preGameCD} !!!</Text>
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
        {gameVisible && <Game gameType={selectedGameType} sock={sock} playerId={playerId} gameRoom={gameRoom}/>}
        {gameVisible && <Button onClick={toggleGame}> Leave </Button>}
    </>);
}

export default CreateGameButton;