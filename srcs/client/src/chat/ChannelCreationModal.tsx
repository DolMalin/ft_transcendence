import React, { useState } from "react"
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Flex,
    useToast,
  } from '@chakra-ui/react'

import { Button, Checkbox, FormControl, Input, Stack } from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import * as Const from '../game/globals/const'
import authService from "../auth/auth.service"
import { Room } from "./interface"
import { Socket } from "socket.io-client"
import BasicToast from "../toast/BasicToast"

  function 
  ChannelCreationModal(props : {isOpen : boolean, onOpen : () => void , onClose : () => void, chatSocket: Socket}) {
    
    const toast = useToast();
    const [checked, setChecked] = useState(false)
    const [room, setRoom] = useState<Room>()
    const [privateChan, setPrivate] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const { register: registerCreate, 
            handleSubmit: handleSubmitCreate, 
            reset: resetCreate, 
            formState: { errors: errorCreate }
    } = useForm()

    const createRoom = async (dt: {room: string, password: string}) => {
        if (dt.room !== "")
        {
            let data = {name: dt.room, password: dt.password, privChan: privateChan}
            try{
                await authService.post(process.env.REACT_APP_SERVER_URL + '/room', data)
                joinRoom(dt)
            }
            catch(err){
                console.error(`${err.response.data.message} (${err.response.data.error})`)
            }
        }
    }


    const  joinRoom = async (dt: {room: string, password: string}) => {
        try{
            const res = await authService.post(process.env.REACT_APP_SERVER_URL + '/room/joinRoom',
            {
                name: dt.room,
                password: dt.password
            })
            setRoom(res.data)
            props.chatSocket?.emit("joinRoom", res.data.id)
            setShowChat(true)
        }
        catch(err){

            if (err.response.status === 409)
            {
                toast({
                    isClosable: true,
                    duration : 5000,
                    render : () => ( <> 
                        <BasicToast text={err.response.data.error}/>
                    </>)
                })
            }
            else
                console.error(`${err.response.data.message} (${err.response.data.error})`)
        }
    }

    const onSubmitCreate = (data: {room: string, password: string}) => {
        createRoom(data)
        resetCreate()
    }

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
                        <h3>Create a channel</h3>
                    </Flex>
                    <form onSubmit={handleSubmitCreate(onSubmitCreate)} style={
                        {
                            alignItems: "center", 
                            display: "flex", 
                            justifyContent:"center", 
                            marginBottom: '10px',
                            width: "100%",
                            flexWrap:"wrap",
                            
                        }}>
                            <FormControl isRequired>
                                <Input
                                    marginBottom="10px"
                                    type="text"
                                    placeholder="Please enter a channel name"
                                    {
                                        ...registerCreate("room", {
                                            required: "enter channel name",
                                            minLength: 2,
                                            maxLength: 80,
                                        })
                                    }
                                />
                            </FormControl>
                        {checked && (
                        <FormControl isRequired>
                            <Input
                                marginBottom="10px"
                                type="password"
                                placeholder="Please enter a password"
                                {
                                    ...registerCreate("password", {
                                        required: "enter password",
                                        minLength: 2,
                                        maxLength: 80,
                                    })
                                }
                            />
                        </FormControl> )}
                        <Button
                        fontWeight={'normal'}
                        borderRadius={'0px'}
                        textAlign={'center'}
                        bg={'none'}
                        textColor={'white'}
                        _hover={{background : 'white', textColor : Const.BG_COLOR}} 
                        type='submit' marginTop="10px"
                        >
                            Create a channel
                        </Button>
                    </form>    
                    <Flex alignItems="center" justifyContent="space-evenly" marginTop="20px" >
                    <Checkbox 
                        colorScheme='green' 
                        onChange={(event) => setChecked(event.target.checked)}> password 
                    </Checkbox>
                    <Checkbox 
                        colorScheme='green' 
                        onChange={(event) => setPrivate((event.target as HTMLInputElement).checked)}> private channel 
                    </Checkbox>
                    </Flex>
            </ModalBody>
            </Flex>
          </ModalContent>
        </Modal>
      </>
    )
  }

  export default ChannelCreationModal