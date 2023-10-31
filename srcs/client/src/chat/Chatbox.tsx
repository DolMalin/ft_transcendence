import React, {useState, useEffect, useMemo} from "react";
import * as Chakra from '@chakra-ui/react'

export function Chatbox(props: any) {
    const [currentMessage, setCurrentMessage] = useState("");
    const sendMessage = async () => {
        if (currentMessage !== ""){
            const messageData = {
                room: props.room,
                author: props.socket.id,
                message: currentMessage,
                time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes()
            };
            await props.socket.emit("sendMessage", messageData);
        }
        
    };
   
    useEffect(() => {
        props.socket.on("receiveMessage", (data: {room: string, author: string, message: string, time: string | number | Date}) => {
            console.log(data)
        })  
    }, [props.socket])
    return (
        <div>
            <div className="chat-header">
                <p>Live chat</p>
            </div>
            <div className="chat-body"></div>
            <div className="chat-footer">
                <Chakra.Input type="text" placeholder="message..." onChange={(event) => {setCurrentMessage(event.target.value)}}/>
                <Chakra.Button onClick={sendMessage}>&#9658;</Chakra.Button>
            </div>
        </div>
    )
}