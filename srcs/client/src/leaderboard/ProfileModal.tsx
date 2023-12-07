import React, { useEffect, useState } from "react"
import {
    Button,
    Box,
    Avatar,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalFooter,
    Text,
  } from '@chakra-ui/react'
import * as Constants from '../game/globals/const'
import authService from "../auth/auth.service";
import { LeftBracket, RightBracket } from "../game/game-creation/Brackets";
import PlayerHistoryAccordion from "./PlayerHistoryAccordion";
import { Socket } from "socket.io-client";

function ProfileModal(props : {userId : string, isOpen : boolean, onOpen : () => void , onClose : () => void, gameSock? : Socket}) {

    const [user, setUser] = useState<any>(null);

    function sendDuelInvite() {
        props.gameSock?.emit('gameInvite', props.userId)
    }
    
    useEffect(() => {
        if (!props.userId)
            return ;
        const fetchUserData = async () => {
            try {
                const response = await authService.get('http://127.0.0.1:4545/users/' + props.userId);
                setUser(response.data);
    
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }
    
        fetchUserData();
    }, [props.userId])

    if (!props.userId)
        return ;
    return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} isCentered={true}>
        <ModalOverlay />
            <ModalContent borderRadius={'0px'} bg={Constants.BG_COLOR_FADED} textColor={'white'} className="goma"
            paddingTop={'10px'} paddingBottom={'10px'}>
                <Box display={'flex'} flexDir={'row'}
                alignContent={'left'}
                alignItems={'center'}
                justifyContent={'center'}
                width={'448px'}
                marginBottom={'20px'}
                >
                    <LeftBracket w={'16px'} h={'42px'} girth={'6px'} marginRight="-4px"/>
                        <Text fontWeight={'normal'} textAlign={'center'} padding={'0px'} fontSize={'2em'}
                        > 
                        {user?.username} 
                        </Text>
                    <RightBracket w={'16px'} h={'42px'} girth={'6px'} marginLeft="-4px"/>
                </Box>

                <ModalBody display={'flex'} flexDir={'row'} padding={'8px'}>
                    <Box width={'128px'} height={'128px'}>
                        <Avatar
                        size='2xl'
                        name={'avatar'}
                        src={'http://127.0.0.1:4545/users/avatar/' + props.userId}
                        marginRight={'10px'}
                        >
                        </Avatar>
                    </Box>

                    <Box width={'128px'} 
                    display={'flex'} flexDir={'column'}
                    alignContent={'left'}
                    alignItems={'center'}
                    justifyContent={'center'}
                    >
                        <Text textAlign={'center'} fontSize={'2em'}> WINS </Text>
                        <Text textAlign={'center'} fontSize={'2em'}> {user?.winsAmount} </Text>
                    </Box>
                    <Box width={'128px'} 
                    display={'flex'} flexDir={'column'}
                    alignContent={'left'}
                    alignItems={'center'}
                    justifyContent={'center'}
                    >
                        <Text textAlign={'center'} fontSize={'2em'}> LOOSES </Text>
                        <Text textAlign={'center'} fontSize={'2em'}> {user?.loosesAmount} </Text>
                    </Box>

                </ModalBody>

                <ModalFooter>
                    <Button colorScheme='none'
                    fontWeight={'normal'}
                    borderRadius={'none'}
                    _hover={{background : 'white', textColor: 'black'}}>
                        Message Them !
                    </Button>

                    <Button colorScheme='none'
                    fontWeight={'normal'}
                    borderRadius={'none'}
                    _hover={{background : 'white', textColor: 'black'}}
                    onClick={sendDuelInvite}
                    >
                        Defy Them !
                    </Button>
                </ModalFooter>
                <PlayerHistoryAccordion userId={user?.id}/>

            </ModalContent>
    </Modal>);
}

export default ProfileModal