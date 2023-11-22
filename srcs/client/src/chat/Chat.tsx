import React , {useState} from "react";
import { ChakraProvider } from "@chakra-ui/react";
import * as Chakra from '@chakra-ui/react'
import { Chatbox } from "./Chatbox";
import './chat.css'
import axios from "axios";
import authService from "../auth/auth.service";

export function Chat(props: any){
    const [room, setRoom] = useState("");
    const [password, setPassword] = useState("")
    const [showChat, setShowChat] = useState(false)
    const [privateChan, setPrivate] = useState(false)
    const [checked, setChecked] = useState(false)

    const createRoom = async () => {
        if (room != "")
        {
            let data = {name: room, password: password, privChan: privateChan}
            try{
                const res = await axios.post('http://127.0.0.1:4545/room', data)
                console.log(res.data)
                joinRoom()
            }
            catch(err){
                console.log('Channel', room, 'already exists.')
            }
        }
    }
 
    const  joinRoom = async () => {

        try{
            console.log('pas', password)
            const res =  await authService.post('http://127.0.0.1:4545/room/joinRoom', {roomName: room, password: password})
            props.socket.emit("joinRoom", room)
            setShowChat(true);
        }
        catch(err){
            console.log(err.response.data.message)
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
                    onChange={(event) => {setRoom(event.target.value)}}
                    />                
                {checked && (
                <Chakra.Input
                    type="text"
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
                    onChange={(event) => {setRoom(event.target.value)}}/>
                <Chakra.Input 
                    type="text"
                    placeholder="enter password (if needed)"
                    onChange={(event => {setPassword(event.target.value)})}
                />
                <Chakra.Button onClick={joinRoom}>Join A Room</Chakra.Button>
            </ChakraProvider>
        </div>
        )
        : (
        <Chatbox socket={props.socket} room={room}/>
        )}
    </div>
    )
}