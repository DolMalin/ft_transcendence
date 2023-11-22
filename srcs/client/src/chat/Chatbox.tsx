import React, {useState, useEffect, useRef} from "react"
import ScrollToBottom from 'react-scroll-to-bottom'
import * as Chakra from '@chakra-ui/react'
import axios from "axios"
import authService from "../auth/auth.service"

function timeOfDay(){
    let hour = new Date(Date.now()).getHours()
    let min =  new Date(Date.now()).getMinutes()
    let tmp = ""
    if (min < 10){
        tmp = "0" + min.toString();
    }
    else
        tmp = min.toString();
    let date = hour.toString() + ":" + tmp;
    console.log(date);
    return (date);
}

export function Chatbox(props: any) {
     
    interface messageData {
        room: string;
        author: string;
        message: string;
        time: string | number;
    };

    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState<messageData[]>([]);
    const inputRef = useRef<HTMLInputElement | null>(null)

    const wipeInput = () => {
        if (inputRef.current){
            inputRef.current.value = ""
        }
    }
    const getMe = async () => {
        try{
         
            const me = await authService.get('http://127.0.0.1:4545/users/me')
            console.log(me.data)

        }catch(err){
            console.log(err)
        }}
    const sendMessage = async () => {
        
        if (currentMessage !== ""){
            const message = {
                       room: props.room,
                author: props.socket.id,
                message: currentMessage,
                time: timeOfDay()
            }
            try{
                const res = await authService.post('http://127.0.0.1:4545/room/message', message)

            }  
            catch(err){
                console.log(err.response.data.message)
            }
            await props.socket.emit("sendMessage", message);
            setMessageList((list) => [...list, {
                room: props.room,
                author: props.socket.id,
                message: currentMessage,
                time: timeOfDay()
            }])
            setCurrentMessage("") 
            wipeInput()
        }
    };
    useEffect(() => {
        props.socket.on("receiveMessage", (data: messageData) => {
        setMessageList((list) => [...list, data])
        })  
    }, [props.socket])

    return (
        <div className="chat-window">
            <div className="chat-header">
                <p>channel: {props.room}</p>
            </div>
            <div className="chat-body">
                <ScrollToBottom className="message-container">
                {messageList.map((messageContent) => {
                    return  <div className="message"  id={props.socket.id === messageContent.author ? "other" : "you"}>
                                <div>
                                    <div className="message-content">
                                        <p>{messageContent.message}</p>
                                    </div>
                                    <div className="message-meta">
                                        <p id="time">{messageContent.time}</p>
                                        <p id="author">{messageContent.author}</p>
                                    </div>
                                </div>
                            </div>
                })}
                </ScrollToBottom>
            </div>
            <div className="chat-footer">
                <Chakra.Input 
                    type="text" 
                    ref={inputRef}
                    placeholder="message..." 
                    onChange={(event) => {setCurrentMessage(event.target.value)}}
                    onKeyPress={(event) => {event.key === "Enter" && sendMessage()}}
                    />
                <Chakra.Button onClick={sendMessage}>
                    <>
                    &#9658;
                    </>
                </Chakra.Button>
                <Chakra.Button onClick={getMe}>
                    test
                </Chakra.Button>
            </div>
        </div>
    )
}