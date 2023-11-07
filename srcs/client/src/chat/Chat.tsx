import React , {useState} from "react";
import { ChakraProvider } from "@chakra-ui/react";
import * as Chakra from '@chakra-ui/react'
import { Chatbox } from "./Chatbox";
import './chat.css'

export function Chat(props: any){
    const [room, setRoom] = useState("");
    const [password, setPassword] = useState("")
    const [showChat, setShowChat] = useState(false);
    const [checked, setChecked] = useState(false);
    const joinRoom = () => {
        if (room !== ""){
            props.socket.emit("joinRoom", room);
            setShowChat(true);
        }
    }
    return (
    <div className="Chat">
        {!showChat ? (
        <div className="joinChatContainer">
            <ChakraProvider>
                <h3>Join a chat</h3>
                <Chakra.Input 
                    type="text" 
                    placeholder="room id ..."
                    onChange={(event) => {setRoom(event.target.value)}}/>
                {checked && ( 
                <Chakra.Input
                    type="text"
                    placeholder="password ..."
                    onChange={(event => {setPassword(event.target.value)})}/>)
                }
                <Chakra.Stack spacing={10} direction='row'>
                <Chakra.Checkbox 
                    colorScheme='green' 
                    onChange={(e) => setChecked(e.target.checked)}> password
                </Chakra.Checkbox>
                </Chakra.Stack>
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