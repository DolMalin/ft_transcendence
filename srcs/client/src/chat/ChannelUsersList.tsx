import React, { useEffect, useState } from "react";
import { Room } from "./interface";
import authService from "../auth/auth.service";
import { Socket } from "socket.io-client";
import BasicToast from "../toast/BasicToast";
import { Button, Flex, UnorderedList, useToast, Box, Divider } from "@chakra-ui/react";
import UserInUsersList from "./UserInUsersList";
import ChannelSettings from "./ChannelSettings";
import * as Constants from '../game/globals/const';
import BanList from "./BanList";

function ChannelUsersList(props : {room : Room, chatSocket : Socket, gameSocket : Socket}) {

    const [isOp, setIsOp] = useState(false)
    const toast = useToast();
    const toastId = 'toast';
    const [listToDisplay, setListToDisplay] = useState('users')
    const [rerender, setRerender] = useState(false)
    const [userList, setUserList] = useState
    <{
        id: string, 
        username: string
    }[]>([]);
    const [me, setMe] = useState<
    {
        id: string, 
        username: string
    } | undefined>(undefined);
    const [banList, setBanList] = useState
    <{
        id: string, 
        username: string
    }[]>([]);

    async function getUserList(roomId: number, me : {username: string, id: string}){
        let userlist : {
            id : string,
            username: string
        }[]
        try{
            const users =  await authService.get(process.env.REACT_APP_SERVER_URL + '/room/userlist/' + roomId)
            userlist = users.data
            userlist = userlist.filter(user => user.id !== me?.id)
        }
        catch(err){
            console.error(`${err.response?.data?.message} (${err.response?.data?.error})`)
        }
        return (userlist);
    }
 
    const fetchUserList = async (me : {username: string, id: string}) => {
        try {
            const array = await getUserList(props.room.id, me)
            setUserList(array)
        }
        catch(err){
            console.error(`${err.response?.data?.message} (${err.response?.data?.error})`)
        }
    }

    const fetchBanList = async (roomId : number) => {
        try {
          const bannedUsersArray = await authService.get(process.env.REACT_APP_SERVER_URL + '/room/bannedList/' + roomId)
          setBanList(bannedUsersArray.data);
        }
        catch(err) {
          console.error(`${err.response?.data?.message} (${err.response?.data?.error})`)
        }
    }

    useEffect(() => {
        
        async function asyncWrapper() {
            try{
                const res = await authService.get(process.env.REACT_APP_SERVER_URL + '/users/me')
                setMe(res.data)
                fetchUserList(res.data)
                fetchBanList(props.room?.id);

                const privi = await authService.post(process.env.REACT_APP_SERVER_URL + '/room/userPrivileges',
                {targetId : res.data.id, roomName : props.room.name})
                if (privi.data === 'isAdmin' || privi.data === 'isOwner')
                  setIsOp(true);
                else
                  setIsOp(false);
            }
            catch(err){
                console.error(`${err.response?.data?.message} (${err.response?.data?.error})`)}
        }

        asyncWrapper();
    }, [rerender])

    useEffect(function sockEvents() {

        function forceRender() {
          if (rerender === true)
            setRerender(false)
          else if (rerender === false)
            setRerender(true);
        };
        props.chatSocket?.on('channelUpdate', forceRender);
  
        props.chatSocket?.on('userJoined', forceRender);

        props.chatSocket?.on('userLeft', forceRender);
  
        props.chatSocket?.on('youGotBanned', () => {
  
          const id = 'test-toast';
          if(!toast.isActive(id)) {
            toast({
              id,
              isClosable: true,
              duration : 5000,
              render : () => ( <> 
                <BasicToast text={'you got banned from ' + props.room.name}/>
            </>)
            })
          }
        
        });
        
        return (() => {
          props.chatSocket?.off('channelUpdate');
          props.chatSocket?.off('userJoined');
          props.chatSocket?.off('userleft');
        })
      }, [props.chatSocket, rerender])

    return (<>
        <Flex 
        width={'100%'}
        height={'100%'}
        flexDir={'row'}
        alignItems={'center'}
        >
          {isOp && <>
            <Flex h={'100%'}
            width={'10%'}
            minW={'64px'}
            flexDir={'column'}
            >
              <Button onClick={() => {setListToDisplay('users')}}
              h={'50%'}
              w={'100%'}
              borderRadius={'0px'}
              bg={'none'}
              textColor={'white'}
              fontWeight={'normal'}
              border={listToDisplay === 'users' ? '1px solid white' : 'none'}
              _hover={{bg: 'white', textColor : 'black', transform : 'scale(1)'}}
              > Userlist
              </Button>

              <Button onClick={() => {setListToDisplay('bans')}}
              h={'50%'}
              w={'100%'}
              borderRadius={'0px'}
              bg={'none'}
              textColor={'white'}
              fontWeight={'normal'}
              border={listToDisplay === 'bans' ? '1px solid white' : 'none'}
              _hover={{bg: 'white', textColor : 'black', transform : 'scale(1)'}}
              > Banlist
              </Button>
            </Flex>
            <Flex h={'100%'} w={'80%'} minW={'224px'}
            overflowY={'auto'} flexDir={'row'} wrap={'wrap'}>
                {listToDisplay === 'users' && <>
                  {userList.map((user, index) => {
                    
                    return (
                      <Flex key={index}
                      h={'50%'}
                      padding={'10px'}
                      alignItems={'center'}>
                            <UserInUsersList 
                            username={user.username}
                            userId={user.id} 
                            room={props.room} 
                            userIsOp={isOp} 
                            chatSock={props.chatSocket}
                            gameSock={props.gameSocket}/>
                        </Flex>)
                  })}
                </>
                }
                {listToDisplay === 'bans' && <BanList banList={banList} room={props.room} chatSock={props.chatSocket}/>}
              </Flex>
            
            <Flex
              height={'100%'}
              width={'10%'}
              minW={'32px'}
              justifyContent={'right'}
            >
              <ChannelSettings chatSocket={props.chatSocket} room={props.room} isOp={isOp}/>
            </Flex>
          </>
          }

          {!isOp && <>
          <Flex width={'90%'}
          height={'100%'}
          minW={'288px'}
          overflowY={'auto'} 
          flexDir={'row'} 
          wrap={'wrap'}
          alignItems={'normal'}
          >
              {userList.map((user, index) => {
                
                return (
                  <Flex key={index}
                  h={'50%'}
                  padding={'10px'}
                  alignItems={'center'}>
                      <UserInUsersList 
                      username={user.username}
                      userId={user.id} 
                      room={props.room} 
                      userIsOp={isOp} 
                      chatSock={props.chatSocket}
                      gameSock={props.gameSocket}/>
                  </Flex>)
              })}
            </Flex>

            <Flex
            height={'100%'}
            width={'10%'}
            minW={'32px'}
            justifyContent={'right'}
            >
              <ChannelSettings chatSocket={props.chatSocket} room={props.room} isOp={isOp}/>
            </Flex>
            </>
            }
        </Flex>
    </>);
};

export default ChannelUsersList