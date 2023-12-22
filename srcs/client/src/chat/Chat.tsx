import React , {useState, useEffect, useLayoutEffect} from "react";
import { Button, ChakraProvider, Flex, useDisclosure } from "@chakra-ui/react";
import * as Chakra from '@chakra-ui/react'
import { Chatbox } from "./Chatbox";
import './chat.css'
import authService from "../auth/auth.service";
import { useForm } from "react-hook-form";
import { Socket } from "socket.io-client";
import ProfileModal from "../profile/ProfileModal";
import { CheckIcon, CloseIcon, EmailIcon } from "@chakra-ui/icons";
import BasicToast from "../toast/BasicToast";
import * as Constants from '../game/globals/const'


export interface MessageData {
    id: number;
    author: {id: string, username: string};
    content: string;
    sendAt: Date;
};

export interface Room {
    id: number,
    name: string,
    message: MessageData[]
}

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

async function getUserList(me : {username: string, id: string}){
    let userList: {
        id: string,
        username: string,
        isFriend: boolean}[]
    try{
        const res =  await authService.get(process.env.REACT_APP_SERVER_URL + '/users/')
        userList = res.data
        userList = userList.filter(user => user.id !== me?.id)
    }
    catch(err){
        throw err
    }
    return userList
}

async function getFriendRequestsReceived() {
    let friendRequestsReceived: {
        id: number,
        creatorId: string,
        creatorUsername: string,
        status: string
    }[]

    try {
        const res = await authService.get(`${process.env.REACT_APP_SERVER_URL}/users/friendRequest/me/received`)
        friendRequestsReceived = res.data
    } catch(err) {
        console.error(`${err.response.data.message} (${err.response.data.error})`)
    }

    return friendRequestsReceived
}

export function Chat(props: {socket: Socket}){
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [me, setMe] = useState<
    {
        id: string, 
        username: string
    } | undefined>(undefined)
    const toast = Chakra.useToast();
    const [room, setRoom] = useState<Room>()
    const [showChat, setShowChat] = useState(false)
    const [privateChan, setPrivate] = useState(false)
    const [checked, setChecked] = useState(false)
    const [id, setId] = useState("")
    const [roomList, setRoomList] = useState
    <{  id: number
        name: string
        password: string | null
        privChan: string | null }[]>([])
    const [userList, setUserList] = useState
    <{  id: string
        username: string,
    isFriend: boolean}[]>([])

    const [friendRequestsReceived, setFriendRequestsReceived] = useState
    <{
        id: number,
        creatorId: string,
        creatorUsername: string,
        status: string
    }[]>([])

    
    const { 
        register: registerJoin, 
        handleSubmit: handleSubmitJoin, 
        reset: resetJoin, 
        formState: { errors: errorJoin }} = useForm()
    const { 
        register: registerCreate, 
        handleSubmit: handleSubmitCreate, 
        reset: resetCreate, 
        formState: { errors: errorCreate }} = useForm()

    const createRoom = async (dt: {room: string, password: string}) => {
        if (dt.room !== "")
        {
            let data = {name: dt.room, password: dt.password, privChan: privateChan}
            try{
                await authService.post(process.env.REACT_APP_SERVER_URL + '/room', data)
                joinRoom(dt)
                fetchRoom()
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
            props.socket?.emit("joinRoom", res.data.id)
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

    const onSubmitJoin = (data: {room: string, password: string}) => {
        joinRoom(data)
        resetJoin()
    }

    const fetchRoom = async () => {
        const rooms = await getRoomList()
        setRoomList(rooms)
    }

    const fetchUserList = async (me : {username: string, id: string}) => {
        try {
            const tab = await getUserList(me)
            setUserList(tab)
        }
        catch(err){
            console.error(`${err.response.data.message} (${err.response.data.error})`)
        }
    }

    const fetchFriendRequestReceived = async () => {
        const friendRequestReceived = await getFriendRequestsReceived()
        setFriendRequestsReceived(friendRequestReceived)
    }

    async function acceptFriend(requestId: number) {
        try {
            const res = await authService.patch(process.env.REACT_APP_SERVER_URL + `/users/friendRequest/response/${requestId}`, {status:'accepted'});
            props.socket?.emit('friendRequestAccepted', {creatorId: res.data.creator.id})
            props.socket?.emit('friendRequestAccepted', {creatorId: res.data.receiver.id})

        } catch(err) {
            console.error(`${err.response.data.message} (${err.response.data.error})`)
        }
    }

    async function removeFriend(requestId: number) {
        try {
            const res = await authService.patch(process.env.REACT_APP_SERVER_URL + `/users/friendRequest/remove/${requestId}`, {status:'undefined'});

            props.socket?.emit('friendRemoved', {creatorId: res.data.creator.id})
            props.socket?.emit('friendRemoved', {creatorId: res.data.receiver.id})

        } catch(err) {
            console.error(`${err.response.data.message} (${err.response.data.error})`)
        }
    }

    useEffect(() => {
        props.socket?.on('userBlocked', (err) => {
            toast({
                title: err.title,
                description:  err.desc,
                colorScheme: 'red',
                status: 'info',
                duration: 5000,
                isClosable: true
              })
        })
        props.socket?.on('dmRoom', (dm) => {
            props.socket?.emit("joinRoom", dm.id)
            setRoom(dm)
            setShowChat(true)
        })
        props.socket?.on('chanInvitedNotification', ({senderId, senderUsername, roomName, targetId}) => {
            const id = 'test-toast';
            if(!toast.isActive(id)) {
            toast({
              id,  
              duration: null,
              render : () => ( <>
                <BasicToast text={'You just got invited by ' + senderUsername  + ' to join ' + roomName + ' !'}>
                    <Button onClick={() => {
                        props.socket?.emit('declinedInviteChan', {roomName, targetId, senderId})
                        toast.closeAll()}}
                    bg={'none'}
                    borderRadius={'0px'}
                    fontWeight={'normal'}
                    textColor={'white'}
                    _hover={{bg: 'white', textColor : Constants.BG_COLOR_FADED}}
                    > 
                    No thanks !
                    </Button>
                    <Button onClick={() => {
                        joinRoom({room: roomName, password: null})
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
          }})

        
        props.socket?.on('declinedNotification', (username: string) => {
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
        return (() => {
            props.socket?.off('userBlocked')
            props.socket?.off('dmRoom')
        })
    })


    useEffect(function socketEvent() {
        props.socket?.on('friendRequestSendedChat', () => {
            fetchUserList(me)
            fetchFriendRequestReceived()
        })

        props.socket?.on('friendRequestAcceptedChat', () => {
            fetchUserList(me)
            fetchFriendRequestReceived()

        })
 
        props.socket?.on('friendRemovedChat', () => {
            fetchUserList(me)
            fetchFriendRequestReceived()
        })

        return (() => {
            props.socket?.off('friendRequestSendedChat');
            props.socket?.off('friendRequestAcceptedChat');
            props.socket?.off('friendRemovedChat');
        })
        
    }, [props.socket])
    
    useEffect(() => {        
        const asyncWrapper = async () => {
            try{
                const res = await authService.get(process.env.REACT_APP_SERVER_URL + '/users/me')
                setMe(res.data)
                fetchUserList(res.data) 
                fetchFriendRequestReceived()
                fetchRoom()
            }
            catch(err){
                console.error(`${err.response.data.message} (${err.response.data.error})`)} 
        }
        asyncWrapper()
    }, [])

    useEffect(() => { 
        fetchFriendRequestReceived()
    }, [props.socket])
    
    return (
        <div>
        <mark>
            <h1>------Channel list-------</h1>
        </mark>
        {roomList?.length > 0 && (
        roomList.map((room, index: number) => (
            <div className="roomlist" key={index}>
                <div>
                    <ul>
                        <li>{room.name}</li>
                    </ul>
                </div>
            </div>
        ))
        )}
         <mark>
            <h1>------User list------</h1>
        </mark>

        {userList?.length > 0 && (
        userList.map((user, index: number) => (
            <Chakra.Flex flexDir="row" key={index} >
                   <div className="userList">
                <div>
                    <ul>
                        <li><Chakra.Link onClick={() => {onOpen() ; setId(user.id)}}>{user.username} {user.isFriend ? "👥" :""}</Chakra.Link></li>
                        <Chakra.IconButton
                            variant='outline'
                            colorScheme='teal'
                            aria-label='Send email'
                            icon={<EmailIcon />}
                            onClick={() => {}}
                            />
                    </ul>
                </div>
            </div>
            </Chakra.Flex>
        
        ))
        
        )}

        <mark>
            <h1>------Friend requests------</h1>
        </mark>
        
        {friendRequestsReceived?.length > 0 && (
            friendRequestsReceived.map((friendRequest, index: number) => (
                <Chakra.Flex flexDir="row" key={index}>
                    <div className="userList">
                        <div>
                            <ul>
                                <li><Chakra.Link onClick={() => {onOpen() ; setId(friendRequest.creatorId)}}>{friendRequest.creatorUsername}</Chakra.Link></li>
                                <Chakra.IconButton
                                    variant='outline'
                                    colorScheme='teal'
                                    aria-label='Accept friend request'
                                    icon={<CheckIcon />}
                                    onClick={() => {acceptFriend(friendRequest.id)}}
                                />

                                <Chakra.IconButton
                                    variant='outline'
                                    colorScheme='red'
                                    aria-label='Decline friend request'
                                    icon={<CloseIcon />}
                                    onClick={() => {removeFriend(friendRequest.id)}}
                                />

                            </ul>
                        </div>
                    </div>
                </Chakra.Flex>
            ))
        )}

        
        <div className="Chat">
            {!showChat ? (
            <div className="joinChatContainer">
                <ChakraProvider>
                    <h3>Create a channel</h3>
                    <form onSubmit={handleSubmitCreate(onSubmitCreate)}>
                            <Chakra.FormControl isRequired>
                                <Chakra.Input
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
                            </Chakra.FormControl>
                        {checked && (
                        <Chakra.FormControl isRequired>
                            <Chakra.Input
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
                        </Chakra.FormControl> )}
                    <Chakra.Button type='submit'>Create a channel</Chakra.Button>
                    </form>    
                    <Chakra.Stack spacing={10} direction='row'>
                    <Chakra.Checkbox 
                        colorScheme='green' 
                        onChange={(event) => setChecked(event.target.checked)}> password 
                    </Chakra.Checkbox>
                    <Chakra.Checkbox 
                        colorScheme='green' 
                        onChange={(event) => setPrivate((event.target as HTMLInputElement).checked)}> private channel 
                    </Chakra.Checkbox>
                    </Chakra.Stack>
                    <h3>Join a channel</h3>
                        <form onSubmit={handleSubmitJoin(onSubmitJoin)}>
                        <Chakra.FormControl isRequired>
                            <Chakra.Input
                                type="text"
                                placeholder="Please enter a channel name"
                                {
                                    ...registerJoin("room", {
                                        required: "enter channel name",
                                        minLength: 2,
                                        maxLength: 80,
                                    })
                                }
                            />
                        </Chakra.FormControl>
                        <Chakra.FormControl>
                            <Chakra.Input
                                type="password"
                                placeholder="Please enter a password"
                                {
                                    ...registerJoin("password", {
                                        minLength: 2,
                                        maxLength: 80,
                                    })
                                }
                            />
                        </Chakra.FormControl>
                    <Chakra.Button type='submit'>Join a channel</Chakra.Button>
                    </form>       
                </ChakraProvider>
            </div>
            )
            : (
            <Chatbox socket={props.socket} room={room} showChat={setShowChat}/>
            )}
        </div>                
        <ProfileModal userId={id} isOpen={isOpen} onClose={onClose} onOpen={onOpen} chatSocket={props.socket}/>
        </div>
    )
}