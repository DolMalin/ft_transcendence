import React, {useState, useEffect, useRef} from "react"
import ScrollToBottom from 'react-scroll-to-bottom'
import authService from "../auth/auth.service"
import { MessageData, Room } from "./Chat"
import { Socket } from "socket.io-client"
import { useForm } from "react-hook-form"
import { Box, ListItem, UnorderedList, Text, Flex, Button, useToast, Slider, SliderFilledTrack, SliderTrack} from "@chakra-ui/react"
import ProfileModal from "../profile/ProfileModal"
import UserInUsersList from "./UserInUsersList"
import BasicToast from "../toast/BasicToast"

function BanList(props : {banList :  {username : string, id : string}[], room : Room, chatSock : Socket}) {

    const toast = useToast();

    async function unbanThem(targetId : string, roomId : number) {
        try {
            await authService.post(process.env.REACT_APP_SERVER_URL + '/room/unbanUser', 
            {targetId : targetId, roomId : roomId});
            props.chatSock?.emit('channelRightsUpdate', {roomId : roomId});
        }
        catch (err) {
            if (err.response.status === 409)
            {
                toast({
                    duration: 5000,
                    isClosable: true,
                    render : () => ( <> 
                        <BasicToast text={err.response.data.error}/>
                    </>)
                  })
            }
            else
              console.error(`${err.response.data.message} (${err.response.data.error})`)
        }
    }

    return (<>
    <Flex bg={'red'}>
            {props.banList?.map((bannedUser, index) => {
                return (
                    <UnorderedList key={index}>
                        <ListItem>
                            <Text> {bannedUser.username}</Text>
                            <Button onClick={() => {unbanThem(bannedUser.id, props.room?.id)}}> Unban </Button>
                        </ListItem>
                    </UnorderedList>
                )
            })}
    </Flex>
    </>)
}

export default BanList