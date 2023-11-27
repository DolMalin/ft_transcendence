import React , {useState} from "react";
import { ChakraProvider } from "@chakra-ui/react";
import * as Chakra from '@chakra-ui/react'
import { Chatbox } from "./Chatbox";
import './chat.css'
import authService from "../auth/auth.service";

export interface MessageData {
    id: number;
    author: {id: string};
    content: string;
    sendAt: Date;
};

export interface Room {
    id: number,
    name: string,
    message: MessageData[]
}

export function Chat(props: any){
    const [roomPlaceholder, setRoomPlaceholder] = useState("")
    const [room, setRoom] = useState<Room>()
    const [password, setPassword] = useState("")
    const [showChat, setShowChat] = useState(false)
    const [privateChan, setPrivate] = useState(false)
    const [checked, setChecked] = useState(false)

    const createRoom = async () => {
        if (roomPlaceholder !== "")
        {
            let data = {name: roomPlaceholder, password: password, privChan: privateChan}
            try{
                await authService.post('http://127.0.0.1:4545/room', data)
                joinRoom()
            }
            catch(err){
                console.log('Channel', roomPlaceholder, 'already exists.')
            }
        }
    }
 
    const  joinRoom = async () => {

        try{
            const res = await authService.post('http://127.0.0.1:4545/room/joinRoom', {name: roomPlaceholder, password: password})
            console.log('res', res)
            setRoom(res.data)
            props.socket.emit("joinRoom", res.data.id)
            setShowChat(true)
        }
        catch(err){
            console.log(err)
        }
    }
    return (
    <div className="Chat">
        {!showChat ? (
        <div className="joinChatContainer">
            <ChakraProvider>
                <h3>Create a channel</h3>
                <Chakra.Input 
                    type="text"
                    placeholder="chose channel name..."
                    onChange={(event) => {setRoomPlaceholder(event.target.value)}}
                    />                
                {checked && (
                <Chakra.Input
                    type="password"
                    placeholder="password ..."
                    onChange={(event => {setPassword(event.target.value)})}/>)
                }
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
                <Chakra.Button onClick={createRoom}>Create a channel</Chakra.Button>
                <h3>Join a channel</h3>
                <Chakra.Input 
                    type="text" 
                    placeholder="enter channel name ..."
                    onChange={(event) => {setRoomPlaceholder(event.target.value)}}/>
                <Chakra.Input 
                    type="password"
                    placeholder="enter password (if needed)"
                    onChange={(event => {setPassword(event.target.value)})}
                />
                <Chakra.Button onClick={joinRoom}>Join A Room</Chakra.Button>
            </ChakraProvider>
        </div>
        )
        : (
        <Chatbox socket={props.socket} room={room} />
        )}
    </div>
    )
}