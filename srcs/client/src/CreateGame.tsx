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
Text, 
Box} from '@chakra-ui/react';
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
    
    /**
    * @description 
    * if toggle is true will toggle the game, if it is false it will untoggleit
    */
    const toggleGame = (toggle : boolean) => {
        
        setLookingForGame(false);
        if (toggle === false)
        {
            const tmp : GameInfo = {
                gameType : selectedGameType, 
                playerId : playerId, 
                roomName : gameRoom
            }
            console.log('Game was toggled off');
            sock.emit('leaveGame', tmp);
            setGameVisible(false);
            setPlayButtonVisible(true);
        }
        else
        {
            console.log('Game was toggled on');
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

    function handleUnload(event : BeforeUnloadEvent) {
        sock.emit('leaveGame', {gameType : selectedGameType, playerId : playerId, roomName : gameRoom});
        //TO DO : handle refresh with pairing the user with a new socket
        // sock.emit('ping');
        event.preventDefault();
    }

    useEffect(() => {
        sock.on('gameOver', (winner : string) => {
            console.log('my Id :', playerId)
            console.log('winner ID : ', winner)
            console.log('my sock ID : ', sock.id)
            if (sock.id === winner)
                console.log("YOU WON")
            else
                console.log('YOU LOST') 
            toggleGame(false);
        });

        // window.addEventListener('beforeunload', handleUnload)

        return (() => {
            sock.off('gameOver');
            // window.removeEventListener('beforeunload', handleUnload);
        })
    }, [])

    function WaitingScreen() {
        
        function leaveQueue() {
            setLookingForGame(false);
            sock.emit('leaveQueue', gameRoom);
            setWaitingScreenVisible(false);
            setPlayButtonVisible(true);
        }

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
                console.log('cd : ', preGameCD)
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
            <div className='waitingScreen'>
                <Text fontSize="2xl" textAlign="center"> GAME LAUNCH IN {preGameCD} !!!</Text>
            </div>
        )
    }
    
    function Form() {

        console.log('SELECTED TYPE : ', selectedGameType)
        console.log('LOOKING FOR GAME ', lookingForGame)
        
        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {

            setSelectedGameType(event.target.value);
        };
    
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
                    <Radio value='1'> type de game 1 </Radio>
                    <Radio value='2'> type de game 2 </Radio>
                    <Radio value='3'> type de game 3 </Radio>
    
                    <Button onClick={() => {setLookingForGame(true)}} alignItems={'center'}> Launch {selectedGameType} </Button>
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
        {gameVisible && <Button onClick={() => {toggleGame(false)}}> Leave </Button>}
    </>);
}

export default CreateGameButton;