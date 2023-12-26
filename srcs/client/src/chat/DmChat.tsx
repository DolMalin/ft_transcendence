import { Avatar, Button, Flex, FormControl, Input, Link, Text, useDisclosure, useToast } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Room } from "./Chat";
import ScrollToBottom from "react-scroll-to-bottom";
import { MessageData } from "./interface";
import { Socket } from "socket.io-client";
import ProfileModal from "../profile/ProfileModal";
import * as Constants from '../game/globals/const'
import authService from "../auth/auth.service";
import BasicToast from "../toast/BasicToast";
import { useForm } from "react-hook-form";
import { ArrowRightIcon } from "@chakra-ui/icons";

function timeOfDay(timestampz: string | Date){
    const dateObj = new Date(timestampz)
    let hour = dateObj.getHours()
    let min =  dateObj.getMinutes()
    let day = dateObj.getDay()
    let month = dateObj.getMonth()
    let year = dateObj.getFullYear()
    let tmp = ""
    let tmp2 = ""
    if (min < 10)
        tmp = "0" + min.toString()
    else
        tmp = min.toString()
    if (day < 10)
        tmp2 = "0" + day.toString()
    else
        tmp2 = day.toString()
    let date = hour.toString() + ":" + tmp + " " + tmp2 + "/" + month + "/" + year
    return (date)
}

function DmRoom(props : {room : Room, chatSocket : Socket, gameSocket : Socket}) {
    const [messageList, setMessageList] = useState<MessageData[]>([]);
    const [id, setId] = useState("");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const [me, setMe] = useState<
    {
        id: string, 
        username: string
    } | undefined>(undefined);
    const { 
    register, 
    handleSubmit, 
    setValue, 
    formState: { errors }} = useForm();

    const onSubmit = (data: {message: string}) => {
        sendMessage(data.message)
        setValue('message', '')
    }

    const sendMessage = async (currentMessage: string) => {
        try {
            const res = await authService.post(process.env.REACT_APP_SERVER_URL + '/room/message', 
            {
              roomId: props.room.id, 
              content: currentMessage, 
              authorId: me.id, 
              authorName: me.username
            })
            const message = res.data;
            props.chatSocket.emit("sendMessage", message)
            setMessageList((list) => [...list, message])
        }
        catch(err){
            if (err.response.status === 409)
            {
                toast({
                    duration: 5000,
                    render : () => ( <> 
                      <BasicToast text={err.response.data.error}/>
                  </>)
                  })
            }
            console.error(`${err.response?.data?.message} (${err.response?.data?.error})`)
        }
    }

    useEffect(() => {
        props.chatSocket?.on("receiveMessage", (data: MessageData) => {
        //si bloque --> pas ca
        setMessageList((list) => [...list, data])
        })
        return (() => {
            props.chatSocket?.off("reveiveMessage")
        })
    }, [props.chatSocket])

    useEffect(() => {
      
    //   setMessageList(props.room.message? props.room.message: [])
    }, [])

    return (<>
        <Flex h={'100%'}
        flexDir={'column'}
        width={'100%'}
        >
            <Flex w={'100%'}
            h={'10%'}
            minH={'80px'}
            justifyContent={'center'}
            alignItems={'center'}
            bg={Constants.BG_COLOR_LESSER_FADE}
            >
                <Avatar margin={'10px'}> </Avatar>
                <Text> CECI EST LE NOM DU MEC </Text>
            </Flex>
            
            <Flex 
            width={'100%'}
            h={'80%'}
            flexDir={'column'}
            overflowY={'auto'}
            overflowX={'hidden'}>
                <ScrollToBottom mode="bottom">
                    {messageList.map((messageContent, index) => {

                    return (
                    <Flex key={index}
                    w={'90%'}
                    bg='none'
                    textColor={'white'}
                    margin={'10px'}
                    justifyContent={messageContent.author.id === me?.id ? "left" : "right"}>
                            <Flex 
                            maxWidth={'70%'}
                            bg={Constants.BG_COLOR_FADED}
                            flexDir={'column'}
                            padding={'10px'}
                            >
                                <Text>{messageContent.content}</Text>


                                <Flex
                                fontSize={'0.5em'}
                                flexDir={'column'}
                                wrap={'wrap'}
                                >
                                    <Text>{timeOfDay(messageContent.sendAt)} </Text>
                                    <Link fontWeight={'bold'} onClick={() => { onOpen(); setId(messageContent.author.id) }}>{messageContent.author.username}</Link>
                                </Flex>
                            </Flex>
                    </Flex>)
                  })}
                </ScrollToBottom>
            </Flex>

            <Flex w={'100%'}
            h={'10%'}
            minH={'80px'}
            flexDir={'row'}
            justifyContent={'center'}
            alignItems={'center'}
            bg={Constants.BG_COLOR_LESSER_FADE}
            >
                <form onSubmit={handleSubmit(onSubmit)} style={
                    {
                        width : '100%',
                        height : '100%',
                        display: 'flex',
                        flexDirection : 'row',
                        justifyContent : 'space-evenly',
                        alignItems : 'center'
                    }
                }>
                    <FormControl isRequired
                    w={'80%'}
                    h={'60px'}>
                        <Input
                            h={'60px'}
                            border={'none'}
                            focusBorderColor="none"
                            borderRadius={'0px'}
                            type='text'
                            placeholder="type your message..."
                            {...register("message", {
                                required: "enter message",
                            })}
                        />
                    </FormControl>

                    <Button 
                    type='submit'
                    borderRadius={'0px'}
                    bg={'none'}
                    _hover={{background : 'none', transform: 'scale(1.4)'}}
                    >
                        <ArrowRightIcon boxSize={4} color={'white'}/>
                    </Button>
              </form>
            </Flex>
        </Flex>
        <ProfileModal userId={id} isOpen={isOpen} onClose={onClose} onOpen={onOpen}
        chatSocket={props.chatSocket} gameSock={props.gameSocket}/>
    </>)
}

export default DmRoom