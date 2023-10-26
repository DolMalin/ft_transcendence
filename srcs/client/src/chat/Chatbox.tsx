import React,  {useState, KeyboardEvent} from "react";
import * as Chakra from '@chakra-ui/react'
import { ConnectedUserList } from "./connectedUserList";

export function Chatbox(props : any) {
    console.log('from chatbox :', props.id)
    const [message, setMessage] = useState("");
    const [sentMessage, setSentMessage] = useState("");
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter")
        {
            props.socket.emit("message", {message : message, targetId : props.id});
        }
    }
    return (<>
        <div>
            <Chakra.Input placeholder='enter your message' onChange={(event) => setMessage(event.target.value)}
             onKeyDown={handleKeyDown}/>
            <Chakra.Button colorScheme='purple' onClick={() => setSentMessage(message)}>Submit bitch</Chakra.Button>
            <div>
                {sentMessage}
            </div>
        </div>
    </>
    )
}