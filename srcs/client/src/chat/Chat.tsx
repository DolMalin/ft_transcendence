import React , {useState, useEffect} from "react";
import { ChakraProvider, useDisclosure } from "@chakra-ui/react";
import * as Chakra from '@chakra-ui/react'
import { Chatbox } from "./Chatbox";
import './chat.css'
import authService from "../auth/auth.service";
import { useForm } from "react-hook-form";
import { Socket } from "socket.io-client";
import ProfileModal from "../leaderboard/ProfileModal";

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
        const res = await authService.get('http://127.0.0.1:4545/room/')
        roomList = res.data
    }
    catch(err){
        console.error(`${err.response.data.message} (${err.response.data.error})`)
    }
    return roomList
}

async function getUserList(){
    let userList: {
        id: string,
        username: string }[]
    try{
        const res = await authService.get(`${process.env.REACT_APP_SERVER_URL}/users/list`)
        userList = res.data
    }
    catch(err){
        console.error(`${err.response.data.message} (${err.response.data.error})`)
    }
    return userList
}

export function Chat(props: {socket: Socket}){
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [room, setRoom] = useState<Room>()
    const [showChat, setShowChat] = useState(false)
    const [privateChan, setPrivate] = useState(false)
    const [checked, setChecked] = useState(false)
    const [roomList, setRoomList] = useState
    <{  id: number
        name: string
        password: string | null
        privChan: string | null }[]>([])
    const [userList, setUserList] = useState
    <{  id: string
        username: string }[]>([])
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
            console.log('dt', dt)
            let data = {name: dt.room, password: dt.password, privChan: privateChan}
            try{
                await authService.post('http://127.0.0.1:4545/room', data)
                joinRoom(dt)
                fetchRoom()
            }
            catch(err){
                console.log('Channel', dt.room, 'already exists.')
            }
        }
    }
 
    const  joinRoom = async (dt: {room: string, password: string}) => {
        try{
            const res = await authService.post('http://127.0.0.1:4545/room/joinRoom',
            {
                name: dt.room,
                password: dt.password
            })
            setRoom(res.data)
            props.socket.emit("joinRoom", res.data.id)
            setShowChat(true)
        }
        catch(err){
            console.log(err)
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

    const fetchUserList = async () => {
        const userList = await getUserList()
        setUserList(userList)
    }

    useEffect(() => {
        fetchUserList()
    }, [])

    useEffect(() => {
        fetchRoom()
    }, [])
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
            <div className="userList" key={index}>
                <ProfileModal userId={user.id} isOpen={isOpen} onClose={onClose} onOpen={onOpen} />
                <div>
                    <ul>
                        <li><Chakra.Link onClick={() => onOpen()}>{user.username}</Chakra.Link></li>
                    </ul>
                </div>
            </div>
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
        </div>
    )
}