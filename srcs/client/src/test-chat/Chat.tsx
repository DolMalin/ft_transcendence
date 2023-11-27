import React , {useState} from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { ConnectedUserList } from "./connectedUserList";
import { Chatbox } from "./Chatbox";

export function Chat(props: any){
    const [Id, setId] = useState();
    return (
    <div className="Chat">
        <header className="Chat-header">
            <ChakraProvider>
                <ConnectedUserList socket={props.socket} fc={setId}/>
                <Chatbox socket={props.socket} id={Id}/>
            </ChakraProvider>
        </header>
    </div>
    )
}