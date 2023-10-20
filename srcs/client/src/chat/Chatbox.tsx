import React,  {useState, KeyboardEvent} from "react";
import * as Chakra from '@chakra-ui/react'

export function Chatbox(props: any) {
    const [message, setMessage] = useState("");
    console.log(message);
    const [sentMessage, setSentMessage] = useState("");
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter")
        {
            console.log('socket :', props.socket);
            props.socket.emit("message", message);
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