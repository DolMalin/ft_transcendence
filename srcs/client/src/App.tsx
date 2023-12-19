import React, {useEffect, useRef, useState, useReducer} from 'react';

import Auth from "./auth/Auth"
import { Chat } from "./chat/Chat"
import CreateGame from './game/game-creation/CreateGame';
import { 
  ChakraProvider, 
  Box,
  Text,
  TabList,
  Tabs,
  Tab,
  TabPanels,
  TabPanel,
  useToast,
  Button,
  CloseButton,
  Flex,
  Link,
  useDisclosure
 } from '@chakra-ui/react'
import { Socket, io } from 'socket.io-client'
import * as Constants from './game/globals/const'
import LeaderBoard from './leaderboard/Leaderboard';
import './fonts.css'
import { LeftBracket, RightBracket } from './game/game-creation/Brackets';
import Profile from './profile/Profile';
import reducer from './auth/components/reducer'
import { stateType } from './auth/components/reducer'
import authService from './auth/auth.service';
import ProfileModal from './profile/ProfileModal';
import BasicToast from './toast/BasicToast';
import ChatTest from './chat/ChatTest';


function Malaise(props : {state: stateType, dispatch: Function, gameSock : Socket, chatSock : Socket}) {

  const tabsRef = useRef(null)
  const [tab, setTab] = useState(0);
  const [switchingFrom, setSwitchingFrom] = useState(false)
  const [fontSize, setFontSize] = useState(window.innerWidth > 1300 ? '2em' : '1em');
  const toast = useToast();

  function acceptInvite(senderSocketId : string,senderId : string, gameType : string) {
    
    toast.closeAll();
    props.gameSock?.emit('acceptedInvite', {senderSocketId : senderSocketId, senderId : senderId, gameType : gameType});
  }

  function close(senderId : string) {
      toast.closeAll();
      props.gameSock.emit('declinedInvite', {senderId : senderId});
  }

  
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
      if (window.innerWidth > 1300)
        setFontSize('2em');
      else if (window.innerWidth > 1000)
        setFontSize('1.5em')
      else if (window.innerWidth > 600)
        setFontSize('1em')
      else if (window.innerWidth < 400)
        setFontSize('0.5em')
    }, Constants.DEBOUNCE_TIME)

    window.addEventListener('resize', debouncedHandleResize)

    return(() => {
      window.removeEventListener('resize', debouncedHandleResize)
    })
  }, [fontSize])

  console.log('App rerender')

  useEffect(function socketEvents() {

    props.gameSock?.on('gameStarted', () => {

      props.gameSock?.emit('closeOpenedModals');
      setSwitchingFrom(true);
      setTab(0)
      window.dispatchEvent(new Event('resize'));
    });

    props.gameSock?.on('isBusy', ({username}) => {

      toast({
        duration: 2000,
        isClosable: true,
        render : () => ( <>
            <BasicToast text={username + " is busy"}/>
        </>)
      })
    })
    props.gameSock?.on('inviteDeclined', ({username}) => {

      toast({
        duration: 5000,
        isClosable: true,
        render : () => ( <>
            <BasicToast text={username + " declined your invitation" }/>
        </>)
      })
    })
    props.gameSock?.on('gotInvited', ({senderSocketId, senderId, senderUsername, gameType}) => {

      toast({
        duration: null,
        render : () => ( <>
          <BasicToast text={'Got invited by ' + senderUsername  + ' to play a ' + gameType + ' game !'}>
              <Button onClick={() => {close(senderId)}}
              bg={'none'}
              borderRadius={'0px'}
              fontWeight={'normal'}
              textColor={'white'}
              _hover={{bg: 'white', textColor : Constants.BG_COLOR_FADED}}
              > 
              No thanks !
              </Button>
              <Button onClick={() => {acceptInvite(senderSocketId, senderId, gameType)}}
              bg={'none'}
              borderRadius={'0px'}
              fontWeight={'normal'}
              textColor={'white'}
              _hover={{bg: 'white', textColor : Constants.BG_COLOR_FADED}}
              >
                Yes please ! 
              </Button>
            </BasicToast>
          </>
        ),
        isClosable: true,
      })
    })

    props.gameSock?.on('duelAccepted', ({gameType, roomName, playerId}) => {
      
      props.gameSock?.emit('joinDuel', {gameType : gameType, roomName : roomName, playerId : playerId})
    })
    
    return(() => {
      props.gameSock?.off('isBusy');
      props.gameSock?.off('inviteDeclined');
      props.gameSock?.off('gotInvited');
      props.gameSock?.off('duelAccepted');
      props.gameSock?.off('gameStarted')
    })
  }, [tab, tabsRef?.current?.tabIndex])

  return (
    <Tabs isFitted variant='enclosed' className='goma' ref={tabsRef}
    index={tab} onChange={(index) => {

      switchingFrom ? setTab(0) : setTab(index); 
      setSwitchingFrom(false); 
      window.dispatchEvent(new Event('resize'));
    }}
    >

      <TabList border='none' mb='2em' 
      margin={'0'} padding={'0'}
      minH={'60px'} 
      textColor={'white'} className='goma'
      overflowX={'auto'} overflowY={'clip'}
      >
        <Tab bgColor={Constants.TABS_COLOR} border={'none'} borderRadius={'0px'} fontSize={fontSize}
        _selected={{background: Constants.TABS_COLOR}}
        >
          {tab === 0 && <LeftBracket w={'15px'} h={'50px'} girth='5px'></LeftBracket>}
          <Text w={'80%'}>Pong</Text>
          {tab === 0 && <RightBracket w={'15px'} h={'50px'} girth='5px'></RightBracket>}
        </Tab>

        <Tab bgColor={Constants.TABS_COLOR} border={'none'} borderRadius={'0px'} fontSize={fontSize}
        _selected={{background: Constants.TABS_COLOR}}
        >
          {tab === 1 && <LeftBracket w={'15px'} h={'50px'} girth='5px'></LeftBracket>}
            <Text w={'80%'}>Chat</Text>
          {tab === 1 && <RightBracket w={'15px'} h={'50px'} girth='5px'></RightBracket>}
        </Tab>

        <Tab bgColor={Constants.TABS_COLOR} border={'none'} borderRadius={'0px'} fontSize={fontSize}
        _selected={{background: Constants.SELECTED_TAB_COLOR}}
        >
          {tab === 2 && <LeftBracket w={'15px'} h={'50px'} girth='5px'></LeftBracket>}
            <Text w={'80%'}>LeaderBoard</Text>
          {tab === 2 && <RightBracket w={'15px'} h={'50px'} girth='5px'></RightBracket>}
        </Tab>

        <Tab bgColor={Constants.TABS_COLOR} border={'none'} borderRadius={'0px'} fontSize={fontSize}
        _selected={{background: Constants.SELECTED_TAB_COLOR}}
        >
          {tab === 3 && <LeftBracket w={'15px'} h={'50px'} girth='5px'></LeftBracket>}
          <Text w={'80%'}>Profile</Text>
          {tab === 3 && <RightBracket w={'15px'} h={'50px'} girth='5px'></RightBracket>}
        </Tab>

      </TabList>

      <TabPanels margin={'0'} padding={'0'}>

        <TabPanel margin={'0'} padding={'0'}>
          <CreateGame sock={props.gameSock}/>
        </TabPanel>

        <TabPanel margin={'0'} padding={'0'}>
          {/* <Chat socket={props.chatSock}/> */}
          <ChatTest/>
        </TabPanel>

        <TabPanel margin={'0'} padding={'0'}>
          <LeaderBoard gameSock={props.gameSock} chatSocket={props.chatSock}/>
        </TabPanel>

        <TabPanel margin={'0'} padding={'0'}>
          {<Profile state={props.state} dispatch={props.dispatch} gameSock={props.gameSock}/>}
        </TabPanel>
    </TabPanels>
  </Tabs>
  )
}


function App() {

  const [state, dispatch] = useReducer(reducer, {
    isAuthenticated: false,
    isRegistered: false,
    isTwoFactorAuthenticated: false,
    isTwoFactorAuthenticationEnabled: false
  })
  
  const [gameSock, setGameSock] = useState<Socket>(null)
  const [chatSock, setChatSock] = useState<Socket>(null)
  const [userId, setUserId] = useState('');

  useEffect(() => {

      gameSock?.on('logout', () => {
        dispatch({type : 'SET_IS_AUTHENTICATED', payload : false});
        gameSock?.disconnect();
      });

      return (() => {
        gameSock?.off('logout');
      })
  }, [gameSock])

  async function getUserId() {

    try {
      const res = await authService.get(`${process.env.REACT_APP_SERVER_URL}/users/me`);
      setUserId(res.data.id)
    }
    catch(err) {
			console.error(`${err.response.data.message} (${err.response.data.error})`)
    }
  }

  useEffect(() => {

        getUserId();

        if (!userId || userId.length <= 0) {
          return
        }

          setChatSock (io(`${process.env.REACT_APP_SERVER_URL}`, {
            query : {
              userId : userId,
              token : authService.getAccessToken(),
              type : 'chat'
            }
          }));
          setGameSock (io(`${process.env.REACT_APP_SERVER_URL}`, {
            query : {
              userId : userId,
              token : authService.getAccessToken(),
              type : 'game'
            }
          }));

  }, [userId]);

  return (<>
    <ChakraProvider>

      <Auth dispatch={dispatch} state={state} gameSock={gameSock}/>
      
      {state.isAuthenticated && state.isRegistered && (state.isTwoFactorAuthenticated || !state.isTwoFactorAuthenticationEnabled) 
      && <Malaise state={state} dispatch={dispatch} gameSock={gameSock} chatSock={chatSock}/>}
    </ChakraProvider>
  </>
  );
}

export default App;
