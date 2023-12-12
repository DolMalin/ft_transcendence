import React, {useState, useEffect, useRef} from "react"
import ScrollToBottom from 'react-scroll-to-bottom'
import * as Chakra from '@chakra-ui/react'
import authService from "../auth/auth.service"
import { MessageData, Room } from "./Chat"
import { Socket } from "socket.io-client"
import { useForm } from "react-hook-form"

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
        tmp = "0" + min.toString()
    else
        tmp = min.toString()
    if (day < 10)
        tmp2 = "0" + day.toString()
    else
        tmp2 = day.toString()
    let date = hour.toString() + ":" + tmp + " " + tmp2 + "/" + month + "/" + year
    return (date)
}

async function getUserList(id: number){
    let userlist : {
        id : string,
        username: string
    }[]
    try{
        const res =  await authService.get('http://127.0.0.1:4545/room/userlist/' + id)
        userlist = res.data
    }
    catch(err){
        console.log(err)
    }
    return userlist
}

export function Chatbox(props: {socket: Socket, room: Room, showChat: Function}) {

    const [messageList, setMessageList] = useState<MessageData[]>([])
    const [me, setMe] = useState
    <{
        id: string, 
        username: string
    } | undefined>(undefined)
    const [userList, setUserList] = useState
    <{
        id: string, 
        username: string
    }[]>([])
    const { 
        register, 
        handleSubmit, 
        reset, 
        formState: { errors }} = useForm()

    const onSubmit = (data: {message: string}) => {
        sendMessage(data.message)
        reset()
    }

    useEffect(()  => {
        console.log('msg', props.room.message)
        setMessageList(props.room.message? props.room.message: [])
        const res = getMe()
        res.then(response => {
            setMe(response.data)
        })
    }, [])
    
    const getMe = async () => {
        try{
            const me = await authService.get('http://127.0.0.1:4545/users/me')
            return me
        }catch(err){
            console.log(err)
        }}
        
    const sendMessage = async (currentMessage: string) => {
        
        try {
            const res = await authService.post('http://127.0.0.1:4545/room/message', {roomId: props.room.id ,content: currentMessage, authorId: me.id, authorName: me.username})
            const message = res.data;
            console.log('----- in send Message ------', message)
            props.socket.emit("sendMessage", message);
            setMessageList((list) => [...list, message])
        }
        catch(err){
            console.log(err)
        }
    }

    const fetchUserList = async () => {
        try {
            const tab = await getUserList(props.room.id)
            setUserList(tab)
        }
        catch(err){
            console.log(err)
        }
    }

    // useEffect(() => {
    //     fetchUserList()
    // }, [])

    //TODO celui qui cree le channel et envoie le premier message bah ca marche pas
    useEffect(() => {
        props.socket?.on("receiveMessage", (data: MessageData) => {
        console.log('---------message--------', data)
        //si bloque --> pas ca
        setMessageList((list) => [...list, data])
        })
        return (() => {
            props.socket?.off("reveiveMessage")
        })
    }, [props.socket])
    //TODO faire en sorte que la userlist re render
    //TODO gere le fait que j ai un undefined chelou quand je join en tant que dm
    return (
        <div>
        {/* <mark>
            <h2>User list</h2>
        </mark>
        {userList?.length > 0 && (
        userList.map((userlist, index: number) => (
            <div className="userlist" key={index}>
                <div>
                    <ul>
                        <li>{userlist.username}</li>
                    </ul>
                </div>
            </div>
        ))
        )} */}
        <><div>
            <Chakra.Button onClick={() => {
                    props.showChat(false)}}>
                back
            </Chakra.Button>
        </div><div className="chat-window">
        <div className="chat-header">
            <p>channel: {props.room.name}</p>
        </div>
        <div className="chat-body">
            <ScrollToBottom className="message-container">
                {messageList.map((messageContent, index) => {
                    return <div className="message" key={index} id={messageContent.author.id === me?.id ? "other" : "you"}>
                        <div>
                            <div className="message-content">
                                <p>{messageContent.content}</p>
                            </div>
                            <div className="message-meta">
                                <p id="time">{timeOfDay(messageContent.sendAt)}</p>
                                <p id="author">{messageContent.author.username}</p>
                            </div>
                        </div>
                    </div>
                })}
            </ScrollToBottom>
        </div>
        <div className="chat-footer">
        <form onSubmit={handleSubmit(onSubmit)}>
            <Chakra.FormControl isRequired>
                <Chakra.Input
                    type="text"
                    placeholder="type your message..."
                    {
                        ...register("message", {
                            required: "enter message",
                            minLength: 1,
                            maxLength: 1000 //todo regarder regle de convention
                        })
                    }
                />
            </Chakra.FormControl>
            <Chakra.Button type='submit'><>&#9658;</></Chakra.Button>
        </form>
        </div>
    </div></></div>
    )
}