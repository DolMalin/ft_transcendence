import { Button, Flex, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, useToast } from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Socket } from "socket.io-client"
import * as Const from '../game/globals/const'
import BasicToast from "../toast/BasicToast"
import * as Constants from '../game/globals/const'

function InviteModal(props : {socket: Socket, roomId: number, isOpen : boolean, onOpen : () => void , onClose : () => void}){

    const { register: registerSetInvite, 
        handleSubmit: handleSubmitInvite, 
        reset: resetInvite, 
        formState: { errors: errorSetPass }
    } = useForm()

    const toast = useToast();

    const onSubmitInvite = (data: {friend: string}) => {
        props.socket?.emit('invitePrivateChannel', {roomId: props.roomId, guestUsername: data.friend})
        props.onClose()
        resetInvite()
    }

    useEffect(() => {
      props.socket?.on('chanInvite', (guestUsername: string) => {
          const id = 'invite-toast';
          if(!toast.isActive(id)){
            toast({
              id,
              isClosable: true,
              duration : 2000,
              render : () => ( <>
                <BasicToast text={`You sent an invitation to ${guestUsername}`}/>
            </>)
            })
          }
        })
    
        // props.socket?.on('chanInvitedNotification', ({senderId, senderUsername, roomName, targetId}) => {
        //   const id = 'test-toast';
        //   if(!toast.isActive(id)) {
        //   toast({
        //     id,  
        //     duration: null,
        //     render : () => ( <>
        //       <BasicToast text={'You just got invited by ' + senderUsername  + ' to join ' + roomName + ' !'}>
        //           <Button onClick={() => {
        //               props.socket?.emit('declinedInviteChan', {roomName, targetId, senderId})
        //               toast.closeAll()}}
        //           bg={'none'}
        //           borderRadius={'0px'}
        //           fontWeight={'normal'}
        //           textColor={'white'}
        //           _hover={{bg: 'white', textColor : Constants.BG_COLOR_FADED}}
        //           > 
        //           No thanks !
        //           </Button>
        //           <Button onClick={() => {
        //               joinRoom({room: roomName, password: null})
        //               toast.closeAll()
        //           }}
        //           bg={'none'}
        //           borderRadius={'0px'}
        //           fontWeight={'normal'}
        //           textColor={'white'}
        //           _hover={{bg: 'white', textColor : Constants.BG_COLOR_FADED}}
        //           >
        //             Yes please ! 
        //           </Button>
        //         </BasicToast>
        //       </>
        //     ),
        //     isClosable: true,
        //   })
        //   props.socket?.on('declinedNotification', (username: string) => {
        //     const id = 'declined-toast';
        //     if(!toast.isActive(id)){
        //       toast({
        //         id,
        //         isClosable: true,
        //         duration : 5000,
        //         render : () => ( <>
        //           <BasicToast text={`${username} declined your invitation `}/>
        //       </>)
        //       })
        //     }
        //   })
        // }})

      return () => {
        props.socket?.off('chanInvite')
        // props.socket?.off('chanInvitedNotification')
      }
    })


    return (
        <>
        <Modal isOpen={props.isOpen} onClose={props.onClose} isCentered>
          <ModalOverlay  
            bg='blackAlpha.300'
            backdropFilter='blur(10px)'
        />   
           <ModalContent borderRadius={'0px'} bg={Const.BG_COLOR_FADED} textColor={'white'} className="goma"
            paddingTop={'10px'} paddingBottom={'10px'}>
                <Flex display={'flex'} flexDir={'row'}
                alignContent={'left'}
                alignItems={'center'}
                justifyContent={'center'}
                width={'448px'}
                marginBottom={'20px'}
                >
            <ModalCloseButton />
            <ModalBody>
                    <Flex alignItems="center" justifyContent="center" marginBottom='20px'>
                    </Flex>
                    <form onSubmit={handleSubmitInvite(onSubmitInvite)}style={
                        {
                            alignItems: "center", 
                            display: "flex", 
                            justifyContent:"center", 
                            width: "100%",
                            flexWrap:"wrap",
                            
                        }}>
                        <FormControl isRequired>
                            <Input
                                marginBottom="10px"
                                type="text"
                                placeholder="Please enter a username"
                                {
                                    ...registerSetInvite("friend", {
                                        required: "enter username",
                                    })
                                }
                            />
                        </FormControl>
                        <Button
                        fontWeight={'normal'}
                        borderRadius={'0px'}
                        textAlign={'center'}
                        bg={'none'}
                        textColor={'white'}
                        _hover={{background : 'white', textColor : Const.BG_COLOR}} 
                        type='submit' marginTop="15px"
                        >
                            Invite your friend
                            </Button>
                    </form>
            </ModalBody>
            </Flex>
          </ModalContent>
        </Modal>
      </>
    )
}

export default InviteModal