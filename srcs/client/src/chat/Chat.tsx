import React , {useState} from "react";
import { ChakraProvider } from "@chakra-ui/react";
import * as Chakra from '@chakra-ui/react'
import { Chatbox } from "./Chatbox";

export function Chat(props: any){
    const [room, setRoom] = useState("");
    const joinRoom = () => {
        if (room !== ""){
            props.socket.emit("joinRoom", room);
        }
    }
    
    return (
    <div className="Chat">
        <header className="Chat-header">
            <ChakraProvider>
                <div>
                    <h3>Join a chat</h3>
                    <Chakra.Input type="text" placeholder="room id ..." onChange={(event) => {setRoom(event.target.value)}}/>
                    <Chakra.Button onClick={joinRoom}>Join A Room</Chakra.Button>
                </div>
            </ChakraProvider>
        </header>
        <Chatbox socket={props.socket} room={room}/>
    </div>
    )
}