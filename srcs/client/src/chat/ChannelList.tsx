import { 
    Flex, 
    Text,
    Link,
    useDisclosure,
    useToast,
    useColorMode,
    Input,
    InputGroup,
    InputLeftElement,
    Button
} from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import { Socket } from "socket.io-client"
import authService from "../auth/auth.service"
import BasicToast from "../toast/BasicToast"
import ChannelPasswordModal from "./ChannelPasswordModal"
import { Room } from "./interface"
import * as Constants from '../game/globals/const'
import { LockIcon, SearchIcon } from "@chakra-ui/icons"
import { Chat } from "./Chat"


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
        console.error(`${err?.response?.data.message} (${err?.response?.data?.error})`)
    }
    return roomList
}

function ChannelList(props: {chatSocket: Socket, setTargetRoom : Function, targetRoom : Room}){
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    const [roomName, setRoomName] = useState<string>()
    const [hoveredRoom, setHoveredRoom] = useState<string | null>(null)
    const [roomnamesNarrower, setRoomnamesNarrower] = useState('')
    const { colorMode } = useColorMode()
    const [roomList, setRoomList] = useState
    <{  id: number
        name: string
        password: string | null
        privChan: string | null }[]>([])

    const  joinRoom = async (dt: {room: string, password: string}) => {
      console.log('from join room')
        try{
            const res = await authService.post(process.env.REACT_APP_SERVER_URL + '/room/joinRoom',
            {
                name: dt.room,
                password: dt.password
            })
            props.setTargetRoom(res.data);
            props.chatSocket?.emit("joinRoom", res.data.id);
        }
        catch(err){

            if (err.response?.status === 409)
            {
                toast({
                    isClosable: true,
                    duration : 5000,
                    render : () => ( <> 
                        <BasicToast text={err.response?.data?.error}/>
                    </>)
                })
            }
            else if (err.response?.status === 403){
                toast({
                    isClosable: true,
                    duration : 5000,
                    render : () => ( <> 
                        <BasicToast text={err.response?.data?.message}/>
                    </>)
                })
            }
            else if (err.response?.status === 404){
              toast({
                  isClosable: true,
                  duration : 5000,
                  render : () => ( <> 
                      <BasicToast text={err.response?.data?.error}/>
                  </>)
              })
          }
            else
                console.error(`${err.response.data.message} (${err.response?.data?.error})`)
        }
    }

    const fetchRoom = async () => {
        const rooms = await getRoomList()

        if (roomnamesNarrower === '')
          setRoomList(rooms);
        else (setRoomList(() => {
          return (rooms.filter((room) => room.name.toLocaleLowerCase().includes(roomnamesNarrower.toLocaleLowerCase())));
        }))
    }
    useEffect(() => {
        fetchRoom()
    }, [])

    useEffect(function socketEvents() {

      props.chatSocket?.on('channelCreated', () => {
        fetchRoom();
      });

      props.chatSocket?.on('channelStatusUpdate', () => {

        fetchRoom();
      })

      return (() => {
        props.chatSocket?.off('channelCreated');
        props.chatSocket?.off('channelStatusUpdate');
      })
    }, [props.chatSocket])

    useEffect(() => {
      fetchRoom()
    }, [roomnamesNarrower])

    useEffect(() => {

      props.chatSocket?.on('chanInvitedNotification', ({senderId, senderUsername, roomName, roomId, targetId}) => {
        console.log('AALLLLLOOOOOOOOO')
        const id = 'invite-toast'
        if(!toast.isActive(id)) {
        toast({
          id,  
          duration: null,
          render : () => ( <>
            <BasicToast text={'You just got invited by ' + senderUsername  + ' to join ' + roomName + ' !'}>
                <Button onClick={() => {
                    props.chatSocket?.emit('declinedInviteChan', {roomName, targetId, senderId})
                    toast.closeAll()}
                }
                bg={'none'}
                borderRadius={'0px'}
                fontWeight={'normal'}
                textColor={'white'}
                _hover={{bg: 'white', textColor : Constants.BG_COLOR_FADED}}
                > 
                No thanks !
                </Button>
                <Button onClick={() => {
                  console.log('from onclick')
                    props.chatSocket?.emit('acceptedInviteChan', {roomId: roomId, roomName: roomName, targetId: targetId})
                    // joinRoom({room: roomName, password: null})
                    toast.closeAll()
                }}
                bg={'none'}
                borderRadius={'0px'}
                fontWeight={'normal'}
                textColor={'white'}
                _hover={{bg: 'white', textColor : Constants.BG_COLOR_FADED}}
                >
                  Yes please ! 
                </Button>
              </BasicToast>
            </>
          ),
          isClosable: true,
        })
      }
      })  
      props.chatSocket?.on('declinedNotification', (username: string) => {
          const id = 'declined-toast';
          if(!toast.isActive(id)){
            toast({
              id,
              isClosable: true,
              duration : 5000,
              render : () => ( <>
                <BasicToast text={`${username} declined your invitation `}/>
            </>)
            })
          }
        })

      props.chatSocket?.on('signalForJoinRoom', (roomName: string) => {
        joinRoom({room: roomName, password: null})
      })
      return (() => {
        props.chatSocket?.off('declinedNotication')
        props.chatSocket?.off('chanInvitedNotification')
        props.chatSocket?.off('signalForJoinRoom')
      })
    })

    function handleChange(event : React.ChangeEvent<HTMLInputElement>) {
      setRoomnamesNarrower(event.target.value)
    }

    return (
        <>
          <Flex
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

            <InputGroup>
              <InputLeftElement pointerEvents='none'>
                <SearchIcon color='gray.300' />
              </InputLeftElement>
              <Input value={roomnamesNarrower} onChange={handleChange}
              marginBottom={'10px'}
              focusBorderColor="black"
              _focus={{bg : 'white', textColor : 'black'}}
              />
            </InputGroup>
    
            {roomList?.length > 0 && (
              roomList.map((room, index: number) => {
                let state: string
                if (room?.privChan) state = 'private'
                else if (room?.password) state = 'password'
                else state = 'default'
                // if (state === 'private') return null 
                return (
                  <Flex
                    key={room.id}
                    border={room.name === props.targetRoom?.name ? '1px solid white' : 'none'}
                    width={'100%'}
                    minH={'45px'}
                    maxWidth={'300px'}
                    marginBottom={'10px'}
                    padding={'4px'}
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
            setTargetRoom={props.setTargetRoom}
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

