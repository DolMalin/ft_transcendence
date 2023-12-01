import React, {useEffect, useState} from "react";
import { Box,
Text,
Button,
Flex
 } from "@chakra-ui/react"
import { Socket } from "socket.io-client";
import * as Constants from '../globals/const'
import authService from "../../auth/auth.service";

 function WaitingScreen(props : {dispatch : Function, sock : Socket, roomName : string}) {
    
    console.log('roomname : ', props.roomName)
    function leaveQueue() {

      props.sock.emit('leaveQueue', {roomName : props.roomName});

      props.dispatch({type : 'SET_LF_GAME', payload : false});
      props.dispatch({type : 'SET_WAITING_SCREEN', payload : false});
      props.dispatch({type : 'SET_GAME_TYPE', payload : ''})
      props.dispatch({type : 'SET_PLAY', payload : true});
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
        }

        window.addEventListener('beforeunload', handleUnload);
        return (() => {window.removeEventListener('beforeunload', handleUnload)})
    }, [props.roomName])

    return (
        <Flex w={'100%'} h={'100%'} minH={'sm'} minHeight={'sm'}
        wrap={'nowrap'}
        flexDirection={'column'}
        alignItems={'center'}
        justifyContent={'center'}
        textColor={'white'}
        >
            <Box width={'100%'} height={'50%'}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            >
                <Text fontSize="2xl" textAlign="center" style={{display : 'flex', flexDirection: 'row'}}>
                    <b>Looking for game {dot} </b>
                </Text>
            </Box>

            <Box width={'100%'} height={'50%'}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            >
                <Button bg={Constants.BG_COLOR} textColor={'white'} borderRadius={'0'} fontSize={'2xl'} fontWeight={'normal'}
                _hover={{background : 'white', textColor: 'black'}}
                onClick={leaveQueue} 
                > 
                Leave Queue </Button>
            </Box>
    </Flex>
    )
}

export default WaitingScreen;