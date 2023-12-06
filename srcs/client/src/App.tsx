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


function Malaise(props : {state: stateType, dispatch: Function, gameSock : Socket, chatSock : Socket}) {

  const tabsRef = useRef(null)
  const [tab, setTab] = useState(0);
  const [switchingFrom, setSwitchingFrom] = useState(false)
  const [fontSize, setFontSize] = useState(window.innerWidth > 1300 ? '2em' : '1.75em');

  
  useEffect(function DOMEvents() {

    function handleResize() {
      if (window.innerWidth > 1300)
        setFontSize('2em');
      else if (window.innerWidth > 1000)
        setFontSize('1.5em')
      else if (window.innerWidth < 800)
        setFontSize('1em')
    }

    window.addEventListener('resize', handleResize)

    return(() => {
      window.removeEventListener('resize', handleResize)
    })
  }, [fontSize])

  useEffect(function socketEvents() {

      props.gameSock?.on('gameStarted', () => {
      
      setSwitchingFrom(true);
      setTab(0)
      // seems pretty weird but on tab change window.inner{Size} is reseted and some Componants depends ont it
      window.dispatchEvent(new Event('resize'))
    })

    return(() => {
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
      margin={'0'} padding={'0'} height={'4vh'} 
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
          <Chat socket={props.chatSock}/>
        </TabPanel>

        <TabPanel margin={'0'} padding={'0'}>
          <LeaderBoard gameSock={props.gameSock}/>
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
      })

      return (() => {
        gameSock?.off('logout');
      })
  }, [gameSock])
  
  useEffect(() => {
    async function handleUnload() {
      if (gameSock != null)
      {
        try {
          await authService.patch(`${process.env.REACT_APP_SERVER_URL}/users/removeGameSocket`, [gameSock?.id]);
          gameSock.emit('availabilityChange', true);
        }
        catch (e) {
          console.log(e.message);
        }
      }
    }

    window.addEventListener('beforeunload', handleUnload);
    return (() => {window.removeEventListener('beforeunload', handleUnload)})
}, [gameSock])

  async function getUserId() {
    try {
      const res = await authService.get(`${process.env.REACT_APP_SERVER_URL}/users/me`);
      setUserId(res.data.id);

    }
    catch(e) {
      console.log('Error on game socket creation : ', e.message);
    }
  }

  useEffect(() => {

        getUserId();
        if (userId != '')
        {
          setChatSock (io(`${process.env.REACT_APP_SERVER_URL}`, {
            query : {
              userId : userId,
              token : authService.getAccessToken()
            }
          }));
          setGameSock (io(`${process.env.REACT_APP_SERVER_URL}`, {
            query : {
              userId : userId,
              token : authService.getAccessToken()
            }
          }));
        }
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
