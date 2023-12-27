import { Button, Link, Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal, useDisclosure, useToast } from "@chakra-ui/react";
import React, { useState } from "react";
import BasicToast from "../toast/BasicToast";
import authService from "../auth/auth.service";
import PasswordSettingsModal from "./PasswordSettingsModal";
import { Socket } from "socket.io-client";
import { Room } from "./Chat";
import { DragHandleIcon } from "@chakra-ui/icons";
import * as Constants from '../game/globals/const';

function ChannelSettings(props : {chatSocket : Socket, room : Room, isOp : boolean, setTargetChannel : Function}) {

    const [action, setAction] = useState("")
    const {isOpen, onOpen, onClose} = useDisclosure()
    const toast = useToast();

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
            if (err.response?.status === 409)
            {
                toast({
                    duration: 5000,
                    render : () => ( <> 
                        <BasicToast text={err.response?.data?.error}/>
                    </>)
                  })
            }
            if (err.response?.status === 404)
            {
                toast({
                    duration: 5000,
                    render : () => ( <> 
                        <BasicToast text={err.response?.data?.error}/>
                    </>)
                  })
            }
            else
                console.error(`${err.response?.data?.message} (${err.response?.data?.error})`)
        }
    }

    function leaveChan(roomId: number){
        
        props.setTargetChannel(undefined);
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
                    <PopoverContent
                    bg={'white'}
                    border={'none'}
                    >
                    <PopoverBody display={'flex'}
                    flexDir={'column'}
                    className="goma"
                    >
                        <Button onClick={() => {
                            onOpen()
                            setAction('setPass')
                        }}
                        borderRadius={'0px'}
                        margin={'10px'}
                        bg={Constants.BG_COLOR}
                        fontWeight={'normal'}
                        textColor={'white'}
                        _hover={{bg : Constants.BG_COLOR, transform : 'scale(1.1)'}}
                        >
                            Set password
                        </Button >
                        <Button onClick={() => {
                            onOpen()
                            setAction('changePass')
                        }}
                        borderRadius={'0px'}
                        margin={'10px'}
                        bg={Constants.BG_COLOR}
                        fontWeight={'normal'}
                        textColor={'white'}
                        _hover={{bg : Constants.BG_COLOR, transform : 'scale(1.1)'}}
                        >
                            change password
                        </Button>
                        <Button onClick={() => removePassword(props.room.id)}
                        borderRadius={'0px'}
                        margin={'10px'}
                        bg={Constants.BG_COLOR}
                        fontWeight={'normal'}
                        textColor={'white'}
                        _hover={{bg : Constants.BG_COLOR, transform : 'scale(1.1)'}}
                        >
                            remove password
                        </Button>
                        <Button onClick={() => {}}
                        borderRadius={'0px'}
                        margin={'10px'}
                        bg={Constants.BG_COLOR}
                        fontWeight={'normal'}
                        textColor={'white'}
                        _hover={{bg : Constants.BG_COLOR, transform : 'scale(1.1)'}}
                        >
                            Invite someone
                        </Button>
                        <Button onClick={() => leaveChan(props.room.id)}
                        borderRadius={'0px'}
                        margin={'10px'}
                        bg={Constants.BG_COLOR}
                        fontWeight={'normal'}
                        textColor={'white'}
                        _hover={{bg : Constants.BG_COLOR, transform : 'scale(1.1)'}}
                        >
                            leave
                        </Button>
                    </PopoverBody>
                    </PopoverContent>
                </Portal>
                </Popover>
            </Link>
        <PasswordSettingsModal action={action} roomId={props.room.id} isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
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

