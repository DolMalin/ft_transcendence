import React, { useEffect, useState } from "react";
import { Room } from "./interface";
import { Socket } from "socket.io-client";
import DmRoom from "./DmChat";
import Channel from "./Channel";


function ChatBoxTest(props : {isDm : boolean, room : Room, gameSocket : Socket, chatSocket : Socket}) {

    const [channelSwitch, setChannelSwitch] = useState('');

    useEffect(() => {
        setChannelSwitch(props.room?.name)
    }, [props.room])
    return (<>
        {props.isDm && <DmRoom room={props.room} gameSocket={props.gameSocket} chatSocket={props.chatSocket}/>}
        {!props.isDm && <Channel room={props.room} gameSocket={props.gameSocket} chatSocket={props.chatSocket}/>}
    </>)
}

export default ChatBoxTest