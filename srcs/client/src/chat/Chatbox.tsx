import React, {useState, useEffect, useRef} from "react"
import ScrollToBottom from 'react-scroll-to-bottom'
import * as Chakra from '@chakra-ui/react'
import authService from "../auth/auth.service"
import { MessageData, Room } from "./Chat"
import { Socket } from "socket.io-client"
import { useForm } from "react-hook-form"
import { useDisclosure } from "@chakra-ui/react"
import ProfileModal from "../profile/ProfileModal"

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

async function getUserList(id: number, me : {username: string, id: string}){
    let userlist : {
        id : string,
        username: string
    }[]
    try{
        const res =  await authService.get(process.env.REACT_APP_SERVER_URL + '/room/userlist/' + id)
        userlist = res.data
        userlist = userlist.filter(user => user.id !== me?.id)
    }
    catch(err){
        console.error(`${err.response.data.message} (${err.response.data.error})`)
    }
    return userlist
}

export function Chatbox(props: {socket: Socket, room: Room, showChat: Function}) {
    
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [id, setId] = useState("")
    const [messageList, setMessageList] = useState<MessageData[]>([])
    const [me, setMe] = useState<
    {
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
        setValue, 
        formState: { errors }} = useForm()

    const onSubmit = (data: {message: string}) => {
        sendMessage(data.message)
        setValue('message', '')
    }

    const sendMessage = async (currentMessage: string) => {
        try {
            const res = await authService.post(process.env.REACT_APP_SERVER_URL + '/room/message', {roomId: props.room.id ,content: currentMessage, authorId: me.id, authorName: me.username})
            const message = res.data;
            props.socket.emit("sendMessage", message);
            setMessageList((list) => [...list, message])
        }
        catch(err){
            console.error(`${err.response.data.message} (${err.response.data.error})`)
        }
    }

    const fetchUserList = async (me : {username: string, id: string}) => {
        try {
            const tab = await getUserList(props.room.id, me)
            setUserList(tab)
        }
        catch(err){
            console.error(`${err.response.data.message} (${err.response.data.error})`)
        }
    }

    useEffect(() => {        
        const asyncWrapper = async () => {
            try{
                const res = await authService.get(process.env.REACT_APP_SERVER_URL + '/users/me')
                setMe(res.data)
                fetchUserList(res.data)
            }
            catch(err){
                console.error(`${err.response.data.message} (${err.response.data.error})`)} 
        }
        setMessageList(props.room.message? props.room.message: [])
        asyncWrapper()
    }, [])

    useEffect(() => {
        props.socket?.on("receiveMessage", (data: MessageData) => {
        //si bloque --> pas ca
        setMessageList((list) => [...list, data])
        })
        return (() => {
            props.socket?.off("reveiveMessage")
        })
    }, [props.socket])
    //TODO faire en sorte que la userlist re render
    return (
        <div>
          <mark>
            <h2>User list</h2>
          </mark>
          {userList?.length > 0 && (
            userList.map((user, index: number) => (
              <Chakra.Flex flexDir="row" key={index}>
                <div className="userList">
                  <div>
                    <ul>
                      <li>
                        <Chakra.Link>
                          <Chakra.Popover>
                            <Chakra.PopoverTrigger>
                              <Chakra.Button>{user.username}</Chakra.Button>
                            </Chakra.PopoverTrigger>
                            <Chakra.Portal>
                              <Chakra.PopoverContent>
                                <Chakra.PopoverBody>
                                  <Chakra.Button onClick={() => ({})}>
                                    admin
                                  </Chakra.Button>
                                  <Chakra.Button onClick={() => ({})}>
                                    ban
                                  </Chakra.Button>
                                  <Chakra.Button onClick={() => ({})}>
                                    mute
                                  </Chakra.Button>
                                  <Chakra.Button onClick={() => ({})}>
                                    kick
                                  </Chakra.Button>
                                </Chakra.PopoverBody>
                              </Chakra.PopoverContent>
                            </Chakra.Portal>
                          </Chakra.Popover>
                        </Chakra.Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </Chakra.Flex>
            ))
          )}
          <div>
            <Chakra.Button onClick={() => props.showChat(false)}>
              back
            </Chakra.Button>
          </div>
          <div className="chat-window">
            <div className="chat-header">
              <p>channel: {props.room.name}</p>
            </div>
            <div className="chat-body">
              <ScrollToBottom className="message-container">
                {messageList.map((messageContent, index) => (
                  <div className="message" key={index} id={messageContent.author.id === me?.id ? "other" : "you"}>
                    <div>
                      <div className="message-content">
                        <p>{messageContent.content}</p>
                      </div>
                      <div className="message-meta">
                        <p id="time">{timeOfDay(messageContent.sendAt)}</p>
                        <p id="author">
                          <Chakra.Link onClick={() => { onOpen(); setId(messageContent.author.id) }}>{messageContent.author.username}</Chakra.Link>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollToBottom>
            </div>
            <div className="chat-footer">
              <form onSubmit={handleSubmit(onSubmit)}>
                <Chakra.FormControl isRequired>
                  <Chakra.Input
                    type="text"
                    placeholder="type your message..."
                    {...register("message", {
                      required: "enter message",
                    })}
                  />
                </Chakra.FormControl>
                <Chakra.Button type='submit'><>&#9658;</></Chakra.Button>
              </form>
            </div>
            <ProfileModal userId={id} isOpen={isOpen} onClose={onClose} onOpen={onOpen} chatSocket={props.socket} />
          </div>
        </div>
      );
}