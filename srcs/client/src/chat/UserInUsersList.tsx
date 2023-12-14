import React, {useState, useEffect, useRef} from "react"
import * as Chakra from '@chakra-ui/react'
import authService from "../auth/auth.service"
import { Socket } from "socket.io-client";
import ProfileModal from "../profile/ProfileModal";

function UserInUsersList(props : {username : string, userId : string, 
    roomName : string, userIsOp : boolean, gameSock? : Socket, chatSock?: Socket}) {

    const [priviColor, setPriviColor] = useState('grey');
    const { isOpen, onOpen, onClose } = Chakra.useDisclosure();
    const toast = Chakra.useToast();


    async function makeThemOp(targetId : string, roomName : string) {
          try {
              await authService.post(process.env.REACT_APP_SERVER_URL + '/room/giveAdminPrivileges', 
              {targetId : targetId, roomName : roomName});
          }
          catch (err) {
            if (err.response.status === 409)
            {
                toast({
                    title: 'You have no rights !',
                    description:  err.response.data.error,
                    status: 'info',
                    duration: 5000,
                    isClosable: true
                  })
            }
            else
              console.error(`${err.response.data.message} (${err.response.data.error})`)
          }
      };
    useEffect(() => {
    async function asyncWrapper() {
        try {
            const privi = await authService.post(process.env.REACT_APP_SERVER_URL + '/room/hasAdminPrivileges',
            {targetId : props?.userId, roomName : props?.roomName});

            console.log(' AHHHHHHHHHHHHHHHHHHHH ' + props.username + ' is ' + privi.data)
            if(privi.data === 'isOwner')
                setPriviColor('blue')
            else if(privi.data === 'isAdmin')
                setPriviColor('green')
            else
                setPriviColor('grey')
        }
        catch (err) {
            console.error(`${err.response.data.message} (${err.response.data.error})`)
        }
    }

    asyncWrapper();
    }, [props?.userId, props?.roomName, props.userIsOp])

    if (props.userIsOp)
    {
    return (<>
        <Chakra.Link>
            <Chakra.Popover>
            <Chakra.PopoverTrigger>
                <Chakra.Button bgColor={priviColor}>{props?.username}</Chakra.Button>
            </Chakra.PopoverTrigger>
            <Chakra.Portal>
                <Chakra.PopoverContent>
                <Chakra.PopoverBody>
                    <Chakra.Button onClick={() => makeThemOp(props?.userId, props?.roomName)}>
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
                    <Chakra.Button onClick={onOpen}>
                    profile
                    </Chakra.Button>
                </Chakra.PopoverBody>
                </Chakra.PopoverContent>
            </Chakra.Portal>
            </Chakra.Popover>
        </Chakra.Link>
        <ProfileModal userId={props.userId} isOpen={isOpen} onClose={onClose} onOpen={onOpen} chatSocket={props.chatSock} gameSock={props.gameSock}/>
    </>)
    }
    else {
        return (<>
            <Chakra.Button onClick={onOpen} bgColor={priviColor}>{props?.username}</Chakra.Button>
            <ProfileModal userId={props.userId} isOpen={isOpen} onClose={onClose} onOpen={onOpen} chatSocket={props.chatSock} gameSock={props.gameSock}/>
        </>)
    }
}

export default UserInUsersList