import React, {useState, useEffect, useRef} from "react"
import * as Chakra from '@chakra-ui/react'
import authService from "../auth/auth.service"
import { Socket } from "socket.io-client";
import ProfileModal from "../profile/ProfileModal";
import { Room } from "./Chat";
import BasicToast from "../toast/BasicToast";
import PswForm from "./PswForm";

function UserInUsersList(props : {username : string, userId : string, 
    room : Room, userIsOp : boolean, gameSock? : Socket, chatSock?: Socket}) {

    const [priviColor, setPriviColor] = useState('grey');
    const [targetIsOp, setTargetIsOp] = useState<"isAdmin" | "isOwner" | "no">("no");
    const [targetIsMuted, setTargetIsMuted] = useState(false);
    const { isOpen, onOpen, onClose } = Chakra.useDisclosure();
    const toast = Chakra.useToast();


    async function makeThemOp(targetId : string, roomName : string, roomId : number) {
          try {
              await authService.post(process.env.REACT_APP_SERVER_URL + '/room/giveAdminPrivileges', 
              {targetId : targetId, roomName : roomName});
              setTargetIsOp('isAdmin')
              props.chatSock?.emit('channelRightsUpdate', {roomId : roomId});
          }
          catch (err) {
            if (err.response.status === 409)
            {
                toast({
                    duration: 5000,
                    isClosable: true,
                    render : () => ( <> 
                        <BasicToast text={err.response.data.error}/>
                    </>)
                  })
            }
            else
              console.error(`${err.response.data.message} (${err.response.data.error})`)
          }
    };

    async function fuckThemOp(targetId : string, roomName : string, roomId : number) {
        try {
            await authService.post(process.env.REACT_APP_SERVER_URL + '/room/removeAdminPrivileges', 
            {targetId : targetId, roomName : roomName});
            setTargetIsOp('no');
            props.chatSock?.emit('channelRightsUpdate', {roomId : roomId});
        }
        catch (err) {
            if (err.response.status === 409)
            {
                toast({
                    duration: 5000,
                    isClosable: true,
                    render : () => ( <> 
                        <BasicToast text={err.response.data.error}/>
                    </>)
                  })
            }
            else
              console.error(`${err.response.data.message} (${err.response.data.error})`)
        }
    }

    async function muteThem(targetId : string, roomId : number, timeInMinutes : number) {
        try {
            
            await authService.post(process.env.REACT_APP_SERVER_URL + '/room/muteUser', 
            {targetId : targetId, roomId : roomId, timeInMinutes : timeInMinutes});
            setTargetIsMuted(true);
            props.chatSock?.emit('channelRightsUpdate', {roomId : roomId});
        }
        catch (err) {
            if (err.response.status === 409)
            {
                toast({
                    duration: 5000,
                    isClosable: true,
                    render : () => ( <> 
                        <BasicToast text={err.response.data.error}/>
                    </>)
                  })
            }
            else
              console.error(`${err.response.data.message} (${err.response.data.error})`)
        }
    }

    async function unmuteThem(targetId : string, roomId : number) {
        try {
            await authService.post(process.env.REACT_APP_SERVER_URL + '/room/unmuteUser', 
            {targetId : targetId, roomId : roomId});
            setTargetIsMuted(false);
            props.chatSock?.emit('channelRightsUpdate', {roomId : roomId});
        }
        catch (err) {
            if (err.response.status === 409)
            {
                toast({
                    duration: 2000,
                    isClosable: true,
                    render : () => ( <> 
                        <BasicToast text={err.response.data.error}/>
                    </>)
                  })
            }
            else
              console.error(`${err.response.data.message} (${err.response.data.error})`)
        }
    }

    async function banThem(targetId : string, roomId : number, timeInMinutes : number) {
        try {

            await authService.post(process.env.REACT_APP_SERVER_URL + '/room/banUser', 
            {targetId : targetId, roomId : roomId, timeInMinutes : timeInMinutes});
            props.chatSock?.emit('channelRightsUpdate', {roomId : roomId});
            props.chatSock?.emit('userGotBanned', {targetId : targetId});
        }
        catch (err) {
            if (err.response.status === 409)
            {
                toast({
                    duration: 5000,
                    render : () => ( <> 
                        <BasicToast text={err.response.data.error}/>
                    </>)
                  })
            }
            else
              console.error(`${err.response.data.message} (${err.response.data.error})`)
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
                console.error(`${err.response.data.message} (${err.response.data.error})`)
        }
    }

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
                console.error(`${err.response.data.message} (${err.response.data.error})`)
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
                console.error(`${err.response.data.message} (${err.response.data.error})`)
        }
    }

    function leaveChan(roomId: number){
        props.chatSock?.emit('leaveRoom', roomId)
    }

    function kick(roomId: number, targetId: string){
        props.chatSock?.emit('kick', {roomId: roomId, targetId: targetId})
    }

    useEffect(() => {
    async function asyncWrapper() {
        try {
            const privi = await authService.post(process.env.REACT_APP_SERVER_URL + '/room/userPrivileges',
            {targetId : props?.userId, roomName : props.room?.name});

            if(privi.data === 'isOwner')
            {
                setPriviColor('blue')
                setTargetIsOp('isOwner')
            }
            else if(privi.data === 'isAdmin')
            {
                setPriviColor('green')
                setTargetIsOp('isAdmin')
            }
            else if (privi.data === 'isMuted')
            {
                setPriviColor('yellow')
                setTargetIsMuted(true);
            }
            else
            {
                setPriviColor('grey')
                setTargetIsOp('no')
            }
        }
        catch (err) {
            console.error(`${err.response.data.message} (${err.response.data.error})`)
        }
    }

    asyncWrapper();
    })


    function MuteBanSlider(props : {targetId : string, roomId : number, actionName : string ,action : Function}) {
        const [sliderValue, setSliderValue] = React.useState(5)
        const [showTooltip, setShowTooltip] = React.useState(false)
        return (<>
            <Chakra.Button onClick={() => props.action(props.targetId, props.roomId, sliderValue)}>
                {props.actionName}
            </Chakra.Button>        
            <Chakra.Slider
            id='slider'
            defaultValue={0}
            min={0}
            max={120}
            colorScheme='teal'
            onChange={(v) => setSliderValue(v)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            >
                <Chakra.SliderTrack>
                    <Chakra.SliderFilledTrack />
                </Chakra.SliderTrack>
                
                <Chakra.Tooltip
                    hasArrow
                    bg='teal.500'
                    color='white'
                    placement='top'
                    isOpen={showTooltip}
                    label={`${sliderValue}min`}
                >
                    <Chakra.SliderThumb />
                </Chakra.Tooltip>
            </Chakra.Slider>
            <Chakra.Text>zero minutes will set timer to an undefined amounth of time</Chakra.Text>
        </>)
    }
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
                        {targetIsOp === 'no'  && <Chakra.Button onClick={() => makeThemOp(props?.userId, props.room?.name, props.room?.id)}>
                            Promote
                        </Chakra.Button>}

                        {targetIsOp === 'isAdmin' && <Chakra.Button onClick={() => fuckThemOp(props?.userId, props.room?.name, props.room?.id)}>
                            Demote
                        </Chakra.Button>}

                        <MuteBanSlider targetId={props?.userId} roomId={props.room?.id} actionName="ban" action={banThem}/>

                        {!targetIsMuted && <MuteBanSlider targetId={props?.userId} roomId={props.room?.id} actionName="mute" action={muteThem}/>}
                        <Chakra.Button onClick={() => unmuteThem(props?.userId, props.room?.id)}>
                            unmute
                        </Chakra.Button>
                        <Chakra.Button onClick={() => kick(props?.room.id, props?.userId)}>
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
        <Chakra.Link>
            <Chakra.Popover>
            <Chakra.PopoverTrigger>
                <Chakra.Button >settings</Chakra.Button>
            </Chakra.PopoverTrigger>
            <Chakra.Portal>
                <Chakra.PopoverContent>
                    <Chakra.PopoverBody>
                        <Chakra.Button onClick={() => setPassword(props.room.id, "motdepasse")}>
                            Set password
                        </Chakra.Button>
                        <Chakra.Button onClick={() => changePassword(props.room.id, "motdepassebise")}>
                            change password
                        </Chakra.Button>
                        <Chakra.Button onClick={() => removePassword(props.room.id)}>
                            remove password
                        </Chakra.Button>
                        <Chakra.Button onClick={() => leaveChan(props.room.id)}>
                            leave
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