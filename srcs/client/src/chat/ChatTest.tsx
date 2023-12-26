import { Divider, Flex, useToast } from "@chakra-ui/react";
import { constants } from "crypto";
import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import * as Constants from '../game/globals/const'
import ChannelCreator from "./ChannelCreator";
import ChannelList from "./ChannelList";
import UserList from "./UserList";
import FriendList from "./FriendList";
import ChatBoxTest from "./ChatBoxTest";
import { Room } from "./interface";
import BasicToast from "../toast/BasicToast";

function ChatTest(props: {chatSocket: Socket, gameSocket : Socket}) {

    type FlexDirection = "column" | "inherit" | "-moz-initial" | "initial" | "revert" | "unset" | "column-reverse" | "row" | "row-reverse" | undefined;

    const [boxWidth, setBoxWidth] = useState(window.innerWidth <= 960 ? '100%' : '15%');
    const [boxHeight, setBoxHeight] = useState(window.innerWidth <= 960 ? 'calc(100% / 3)' : '100%');
    const [flexDir, setFlexDir] = useState<FlexDirection>(window.innerWidth <= 960 ? 'column' : 'row');
    const [targetRoom, setTargetRoom] = useState<Room>(undefined);
    const toast = useToast();

    useEffect(function DOMEvents() {

        function debounce(func : Function, ms : number) {
          let timer : string | number | NodeJS.Timeout;
      
          return ( function(...args : any) {
              clearTimeout(timer);
              timer = setTimeout( () => {
                  timer = null;
                  func.apply(this, args)
              }, ms);
          });
        };
    
        const debouncedHandleResize = debounce (function handleResize() {
            if (window.innerWidth <= 960)
            {
                setBoxWidth('100%');
                setBoxHeight('calc(100% / 3)');
                setFlexDir('column');
            }
            else
            {
                setBoxWidth('15%');
                setBoxHeight('100%');
                setFlexDir('row');
            }

        }, Constants.DEBOUNCE_TIME)
    
        window.addEventListener('resize', debouncedHandleResize)
    
        return(() => {
          window.removeEventListener('resize', debouncedHandleResize)
        })
      }, [])

    
    useEffect(function sockEvent() {
    
        props.chatSocket?.on('kickBy', (kickByUsername: string, roomName : string) => {

        if (targetRoom && roomName === targetRoom?.name)
        {
            setTargetRoom(undefined);
        }
        
        const id = 'test-toast';
        if(!toast.isActive(id)) {
            toast({
            id,
            isClosable: true,
            duration : 5000,
            render : () => ( <> 
                <BasicToast text={'you have been kicked from ' + roomName + ` by ${kickByUsername}`}/>
            </>)
            })
        }
        })
    
        return (() => {
            props.chatSocket?.off('kickBy');
        })
    })
console.log('rerender in ChatText.tsx')

    return (<>
    <Flex
    w={'100%'}
    h={Constants.BODY_HEIGHT}
    wrap={'nowrap'}
    flexDir={flexDir}
    textColor={'white'}
    >

        <Flex
        w={boxWidth}
        h={boxHeight}
        minH={'320px'}
        flexDir={'column'}
        bg={Constants.BG_COLOR}
        >
            <Flex h={'100px'}
            w={'100%'}
            bg={Constants.BG_COLOR}
            justifyContent='center'
            alignItems='center'
            >
                <ChannelCreator chatSocket={props.chatSocket}/>
            </Flex>
            <Flex justifyContent='center'>
                <Divider variant='dashed' width='90%' />
            </Flex>
            <Flex h={'95%'}
            w={'100%'}
            bg={Constants.BG_COLOR}
            >
                <ChannelList chatSocket={props.chatSocket} setTargetRoom={setTargetRoom} targetRoom={targetRoom}/>
            </Flex>
        </Flex>

        <Flex
        w={boxWidth === '100%' ? boxWidth : '70%'}
        h={boxHeight}
        minH={'320px'}
        bg={Constants.BG_COLOR_FADED} 
        >
            {targetRoom != undefined && 
            <ChatBoxTest isDm={targetRoom.type === 'dm' ? true : false}
            room={targetRoom}
            gameSocket={props.gameSocket}
            chatSocket={props.chatSocket}
            setTargetRoom={setTargetRoom}
            />}
        </Flex>

        <Flex
        w={boxWidth}
        h={boxHeight}
        minH={'320px'}
        bg={Constants.BG_COLOR}
        flexDir={'column'} 
        >
            <FriendList socket={props.chatSocket}/>

            <Flex justifyContent='center'>
                <Divider variant='dashed' width='90%' />
            </Flex>

            <Flex h={'50%'}
            w={'100%'}
            bg={Constants.BG_COLOR}
            >
            <UserList chatSocket={props.chatSocket}/>
            </Flex>
        </Flex>
    </Flex>
    </>)
}

export default ChatTest