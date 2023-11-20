import React , {useState} from "react";
import { ChakraProvider } from "@chakra-ui/react";
import * as Chakra from '@chakra-ui/react'
import { Chatbox } from "./Chatbox";
import './chat.css'
import axios from "axios";
import authService from "../auth/auth.service";

export function Chat(props: any){
    const [room, setRoom] = useState("");
    const [password, setPassword] = useState("")
    const [showChat, setShowChat] = useState(false);
    const [checked, setChecked] = useState(false);

    const createRoom = async () => {
        if (room != "")
        {
            let data = {name: room, password: password}
            await axios.post('http://127.0.0.1:4545/room', data)
                .then(response =>{
                    console.log('Réponse du serveur :', response.data);
                    console.log('Statut de la réponse :', response.status);
                    console.log('En-têtes de la réponse :', response.headers);
                    joinRoom()
                })
                .catch(error => {
                    console.log('Channel', room, 'already exists.')
                })
        }
    }
 
   const getAllRoom = async () => {
        
        try{
            const allRoom = await authService.get('http://127.0.0.1:4545/room')
            return allRoom;
        }catch(err){
            console.log(err)
        }
    }
    
    const  joinRoom = async () => {
       
        await getAllRoom()
            .then(response => {
                let roomList = response.data
                let bool = roomList.some((obj: { name: string}) => obj.name === room)
                if (bool === true){
                    props.socket.emit("joinRoom", room)
                    setShowChat(true);
                }
                else{
                    console.log("ERR: channel", room, "doesnt exist.")
                }

        })
    }
    return (
    <div className="Chat">
        {!showChat ? (
        <div className="joinChatContainer">
            <ChakraProvider>
                <h3>Create a channel</h3>
                <Chakra.Input 
                    type="text"
                    placeholder="chose channel name..."
                    onChange={(event) => {setRoom(event.target.value)}}
                    />                
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
                <Chakra.Button onClick={createRoom}>Create a channel</Chakra.Button>
                <h3>Join a channel</h3>
                <Chakra.Input 
                    type="text" 
                    placeholder="enter channel name ..."
                    onChange={(event) => {setRoom(event.target.value)}}/>
                <Chakra.Input 
                    type="text"
                    placeholder="enter password (if needed)"
                />
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