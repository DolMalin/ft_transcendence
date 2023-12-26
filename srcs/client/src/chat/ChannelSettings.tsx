import { Button, Link, Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal, useToast } from "@chakra-ui/react";
import React from "react";
import BasicToast from "../toast/BasicToast";
import authService from "../auth/auth.service";
import { Socket } from "socket.io-client";
import { Room } from "./Chat";
import { DragHandleIcon } from "@chakra-ui/icons";

function ChannelSettings(props : {chatSocket : Socket, room : Room, isOp : boolean}) {

    const toast = useToast();

    async function changePassword(roomId: number, password: string){
        try{
            await authService.post(process.env.REACT_APP_SERVER_URL + '/room/changePassword', 
            {
                roomId: roomId, 
                password: password
            })
            toast({
                duration: 5000,
                render : () => ( <> 
                    <BasicToast text="Password have been successfully updated."/>
                </>)
              })
        }
        catch(err){
            if (err.response.status === 409)
            {
                toast({
                    duration: 5000,
                    render : () => ( <> 
                        <BasicToast text={err.response.data.error}/>
                    </>)
                  })
            }
            if (err.response.status === 404)
            {
                toast({
                    duration: 5000,
                    render : () => ( <> 
                        <BasicToast text={err.response.data.error}/>
                    </>)
                  })
            }
            else
                console.error(`${err.response?.data?.message} (${err.response?.data?.error})`)
        }
    }

    async function removePassword(roomId: number){
        try{
            await authService.post(process.env.REACT_APP_SERVER_URL + '/room/removePassword', {roomId: roomId})
            toast({
                duration: 5000,
                render : () => ( <> 
                    <BasicToast text="Password have been successfully removed."/>
                </>)
              })
        }
        catch(err){
            if (err.response.status === 409)
            {
                toast({
                    duration: 5000,
                    render : () => ( <> 
                        <BasicToast text={err.response.data.error}/>
                    </>)
                  })
            }
            if (err.response.status === 404)
            {
                toast({
                    duration: 5000,
                    render : () => ( <> 
                        <BasicToast text={err.response.data.error}/>
                    </>)
                  })
            }
            else
                console.error(`${err.response?.data?.message} (${err.response?.data?.error})`)
        }
    }

    async function setPassword(roomId: number, password: string){
        try{
            await authService.post(process.env.REACT_APP_SERVER_URL + '/room/setPassword', 
            {
                roomId: roomId, 
                password: password
            })
            toast({
                duration: 5000,
                render : () => ( <> 
                    <BasicToast text="Password have been successfully set."/>
                </>)
              })
        }
        catch(err){
            if (err.response.status === 409)
            {
                toast({
                    duration: 5000,
                    render : () => ( <> 
                        <BasicToast text={err.response.data.error}/>
                    </>)
                  })
            }
            if (err.response.status === 404)
            {
                toast({
                    duration: 5000,
                    render : () => ( <> 
                        <BasicToast text={err.response.data.error}/>
                    </>)
                  })
            }
            else
                console.error(`${err.response?.data?.message} (${err.response?.data?.error})`)
        }
    }

    function leaveChan(roomId: number){
        props.chatSocket?.emit('leaveRoom', roomId)
    }

    if (props.isOp) {

        return <>
            <Link>
                <Popover>
                <PopoverTrigger>
                    <Button 
                    bg={'none'}
                    _hover={{bg:'none', transform : 'scale(1.4)'}}
                    ><DragHandleIcon color={'white'}/></Button>
                </PopoverTrigger>
                <Portal>
                    <PopoverContent>
                        <PopoverBody>
                            <Button onClick={() => setPassword(props.room.id, "motdepasse")}>
                                Set password
                            </Button>
                            <Button onClick={() => changePassword(props.room.id, "motdepassebise")}>
                                change password
                            </Button>
                            <Button onClick={() => removePassword(props.room.id)}>
                                remove password
                            </Button>
                            <Button onClick={() => leaveChan(props.room.id)}>
                                leave
                            </Button>
                        </PopoverBody>
                    </PopoverContent>
                </Portal>
                </Popover>
            </Link>
        </>
    }
    else {

        return (<>
            <Link>
                <Popover>
                <PopoverTrigger>
                    <Button 
                    bg={'none'}
                    _hover={{bg:'none', transform : 'scale(1.4)'}}
                    ><DragHandleIcon color={'white'}/></Button>
                </PopoverTrigger>
                <Portal>
                    <PopoverContent>
                        <PopoverBody>
                            <Button onClick={() => leaveChan(props.room.id)}>
                                leave
                            </Button>
                        </PopoverBody>
                    </PopoverContent>
                </Portal>
                </Popover>
            </Link>
        </>)
    }
}

export default ChannelSettings