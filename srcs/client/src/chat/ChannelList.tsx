import { 
    Flex, 
    ListItem, 
    UnorderedList,
    Text,
    Link,
    useDisclosure,
    useToast,
    Box,
    useColorMode
} from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import { Socket } from "socket.io-client"
import authService from "../auth/auth.service"
import BasicToast from "../toast/BasicToast"
import ChannelPasswordModal from "./ChannelPasswordModal"
import { Room } from "./interface"
import * as Constants from '../game/globals/const'
import { CheckCircleIcon, EmailIcon, LockIcon } from "@chakra-ui/icons"


async function getRoomList(){
    let roomList: { 
        id: number 
        name: string 
        password: string | null 
        privChan: string | null }[]
    try{
        const res = await authService.get(process.env.REACT_APP_SERVER_URL + '/room/list')
        roomList = res.data
    }
    catch(err){
        console.error(`${err.response.data.message} (${err.response.data.error})`)
    }
    return roomList
}

function ChannelList(props: {chatSocket: Socket, setTargetRoom : Function}){
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    const [roomName, setRoomName] = useState<string>()
    const [isHovered, setIsHovered] = useState(false)
    const [hoveredRoom, setHoveredRoom] = useState<string | null>(null)
    const [room, setRoom] = useState<Room>()
    const { colorMode } = useColorMode()
    const [roomList, setRoomList] = useState
    <{  id: number
        name: string
        password: string | null
        privChan: string | null }[]>([])

    const  joinRoom = async (dt: {room: string, password: string}) => {
        try{
            const res = await authService.post(process.env.REACT_APP_SERVER_URL + '/room/joinRoom',
            {
                name: dt.room,
                password: dt.password
            })
            setRoom(res.data)
            props.setTargetRoom(res.data)
            props.chatSocket?.emit("joinRoom", res.data.id)
            // setShowChat(true)
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
            else if (err.response.status === 403){
                toast({
                    isClosable: true,
                    duration : 5000,
                    render : () => ( <> 
                        <BasicToast text={err.response.data.message}/>
                    </>)
                })
            }
            else
                console.error(`${err.response.data.message} (${err.response.data.error})`)
        }
    }

    const fetchRoom = async () => {
        const rooms = await getRoomList()
        setRoomList(rooms)
    }
    useEffect(() => {
        fetchRoom()
    }, [])
    return (
        <>
          <Flex
            h={'50%'}
            w={'100%'}
            bg={Constants.BG_COLOR}
            padding={'10px'}
            wrap={'nowrap'}
            flexDir={'column'}
            overflowY={'auto'}
          >
            <Text w={'100%'} textAlign={'center'} marginBottom={'10px'}>
              Channel List
            </Text>
    
            {roomList?.length > 0 && (
              roomList.map((room, index: number) => {
                let state: string
                if (room?.privChan) state = 'private'
                else if (room?.password) state = 'password'
                else state = 'default'
                if (state === 'private') return null 
                return (
                  <Flex
                    key={room.id}
                    width={'100%'}
                    minH={'45px'}
                    maxWidth={'300px'}
                    marginBottom={'10px'}
                    flexDir={'column'}
                    alignItems={'center'}
                    _hover={{ background: 'white', textColor: Constants.BG_COLOR }}
                    bgColor={Constants.BG_COLOR_FADED}
                    onClick={() => {
                      if (room.password) {
                        onOpen()
                        setRoomName(room.name)
                      } else {
                        joinRoom({ room: room.name, password: room?.password })
                      }
                    }}
                    onMouseEnter={() => setHoveredRoom(room.name)}
                    onMouseLeave={() => setHoveredRoom(null)}
                  >
                    <Flex w={'100%'} flexDir={'row'} alignItems={'center'}>
                      <Link
                        overflow={'hidden'}
                        textOverflow={'ellipsis'}
                      >
                        {room.name}{' '}
                      </Link>
                    </Flex>
                    {state === 'password' && (
                      <Flex
                        w={'100%'}
                        justifyContent={'right'}
                        paddingBottom={'10px'}
                        paddingRight={'10px'}
                      >
                        <LockIcon
                          boxSize={4}
                          color={hoveredRoom === room.name ? 'black' : 'white'}
                        />
                      </Flex>
                    )}
                  </Flex>
                )
              })
            )}
          </Flex>
          <ChannelPasswordModal
            roomName={roomName}
            isOpen={isOpen}
            onClose={onClose}
            onOpen={onOpen}
            chatSocket={props.chatSocket}
          />
        </>
      )
    }
    
    

export default ChannelList

