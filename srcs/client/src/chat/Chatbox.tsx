import React, {useState, useEffect, useRef} from "react"
import ScrollToBottom from 'react-scroll-to-bottom'
import * as Chakra from '@chakra-ui/react'
import axios from "axios"
import authService from "../auth/auth.service"
import { MessageData, Room } from "./Chat"
import { Socket } from "socket.io-client"

function timeOfDay(timestampz: string | Date){
    const dateObj = new Date(timestampz)
    let hour = dateObj.getHours()
    let min =  dateObj.getMinutes()
    let day = dateObj.getDay()
    let month = dateObj.getMonth()
    let year = dateObj.getFullYear()
    let tmp = ""
    let tmp2 = ""
    if (min < 10)
        tmp = "0" + min.toString();
    else
        tmp = min.toString();
    if (day < 10)
        tmp2 = "0" + day.toString();
    else
        tmp2 = day.toString()
    let date = hour.toString() + ":" + tmp + " " + tmp2 + "/" + month + "/" + year;
    console.log(date);
    return (date);
}

export function Chatbox(props: {socket: Socket, room: Room}) {

    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState<MessageData[]>([]);
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [me, setMe] = useState<{id: string, username: string} | undefined>(undefined)

    useEffect(()  => {
        if (props.room.message){
            props.room.message.reverse()
        }
        setMessageList(props.room.message? props.room.message: [])
        const res = getMe()
        res.then(response => {
            setMe(response.data)
        })
    }, [])

    const wipeInput = () => {
        if (inputRef.current){
            inputRef.current.value = ""
        }
    }

    const getMe = async () => {
        try{
            const me = await authService.get('http://127.0.0.1:4545/users/me')
            console.log(me.data)
            return me
        }catch(err){
            console.log(err)
        }}
    
    const sendMessage = async () => {
        
        try {
            if (currentMessage !== ""){
                const res = await authService.post('http://127.0.0.1:4545/room/message', {roomId: props.room.id ,content: currentMessage, author: me.id})
                const message = res.data;
                console.log(message)
                props.socket.emit("sendMessage", message);
                setMessageList((list) => [...list, message])
                setCurrentMessage("") 
                wipeInput()
            }
        } 
        catch(err){
            console.log(err)
        }

        
    };
    useEffect(() => {
        props.socket.on("receiveMessage", (data: MessageData) => {
        setMessageList((list) => [...list, data])
        })  
    }, [props.socket])
    console.log('socket', props.socket.id)
    return (
        <div className="chat-window">
            <div className="chat-header">
                <p>channel: {props.room.name}</p>
            </div>
            <div className="chat-body">
                <ScrollToBottom className="message-container">
                {messageList.map((messageContent) => {
                    return  <div className="message" key={messageContent.id}  id={messageContent.author.id  === me?.id  ? "other" : "you"}>
                                <div>
                                    <div className="message-content">
                                        <p>{messageContent.content}</p>
                                    </div>
                                    <div className="message-meta">
                                        <p id="time">{timeOfDay(messageContent.sendAt)}</p>
                                        <p id="author">{me?.username}</p>
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
            </div>
        </div>
    )
}