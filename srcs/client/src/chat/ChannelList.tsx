import { 
    Flex, 
    ListItem, 
    UnorderedList,
    Text,
    Link,
    useDisclosure
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react"
import authService from "../auth/auth.service";
import { Room } from "./interface"


async function getRoomList(){
    let roomList: { 
        id: number; 
        name: string; 
        password: string | null; 
        privChan: string | null }[]; 
    try{
        const res = await authService.get(process.env.REACT_APP_SERVER_URL + '/room/list')
        roomList = res.data
    }
    catch(err){
        console.error(`${err.response.data.message} (${err.response.data.error})`)
    }
    return roomList
}

function ChannelList(){
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [roomList, setRoomList] = useState
    <{  id: number
        name: string
        password: string | null
        privChan: string | null }[]>([])

    const fetchRoom = async () => {
        const rooms = await getRoomList()
        setRoomList(rooms)
    }
    useEffect(() => {
        fetchRoom()
    }, [])
    return (
        <>
        <Flex  width='100%' flexDir='column' >
        <Text fontSize='1xl' textColor='white' paddingBottom='10px' paddingTop='10px' textAlign='center'>Channel list</Text>
        {roomList?.length > 0 && (
        roomList.map((room, index: number) => (
            <UnorderedList key={index} width='100%'>
                <ListItem ><Link color='white' onClick={() => {
                    if (room.password){
                        onOpen()
                    }
                    }}>{room.name}</Link></ListItem>
            </UnorderedList>
        ))
        )}
        </Flex>
        </>
    )
}

export default ChannelList