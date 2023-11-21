import React, { Profiler, useEffect, useState } from 'react';

import './App.css';
import {CookiesProvider, useCookies}  from 'react-cookie';
import Auth from "./auth/Auth"
import CreateGameButton from './game/CreateGame';
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
import * as Constants from './game/const'
import LeaderBoard from './game/Leaderboard';
import './fonts.css'
import { LeftBracket, RightBracket } from './game/game-creation/Brackets';
import { constants } from 'crypto';

const gameSock = io('http://10.14.6.7:4545')

function GameBox(props : {socket : Socket}) {
  return (
        <Box id={Constants.GAME_ZONE}
        width={'100vw'}
        height={'96vh'}
        display={'flex'}
        alignItems={'center'}
        justifyContent={'center'}
        overflow={'auto'}
        flexWrap={'wrap'}
        background={Constants.BG_COLOR}
        >
          <CreateGameButton sock={props.socket}/>
        </Box>
  )
}


function Malaise() {

  const [tab, setTab] = useState(1);
  const [fontSize, setFontSize] = useState(window.innerWidth > 1300 ? '2em' : '1.75em');

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 1300)
        setFontSize('2em');
      else if (window.innerWidth > 1000)
        setFontSize('1.5em')
      else if (window.innerWidth < 800)
        setFontSize('1em')
    }

    window.addEventListener('resize', handleResize)
  }, [fontSize])

  return (
    <Tabs isFitted variant='enclosed' className='goma'>

      <TabList border='none' mb='2em' 
      margin={'0'} padding={'0'} height={'4vh'} 
      minH={'60px'} 
      textColor={'white'} className='goma'
      overflowX={'auto'} overflowY={'clip'}
      >
        <Tab bgColor={Constants.TABS_COLOR} border={'none'} borderRadius={'0px'} fontSize={fontSize}
        _selected={{background: Constants.TABS_COLOR}}
        onClick={() => {setTab(1)}} onFocus={() => {setTab(1)}}
        >
          {tab === 1 && <LeftBracket w={'15px'} h={'50px'} girth='5px'></LeftBracket>}
          <Text w={'80%'}>Pong</Text>
          {tab === 1 && <RightBracket w={'15px'} h={'50px'} girth='5px'></RightBracket>}
        </Tab>

        <Tab bgColor={Constants.TABS_COLOR} border={'none'} borderRadius={'0px'} fontSize={fontSize}
        _selected={{background: Constants.TABS_COLOR}}
        onClick={() => {setTab(2)}} onFocus={() => {setTab(2)}}
        >
          {tab === 2 && <LeftBracket w={'15px'} h={'50px'} girth='5px'></LeftBracket>}
            <Text w={'80%'}>Chat</Text>
          {tab === 2 && <RightBracket w={'15px'} h={'50px'} girth='5px'></RightBracket>}
        </Tab>

        <Tab bgColor={Constants.TABS_COLOR} border={'none'} borderRadius={'0px'} fontSize={fontSize}
        _selected={{background: Constants.SELECTED_TAB_COLOR}}
        onClick={() => {setTab(3)}} onFocus={() => {setTab(3)}}
        >
          {tab === 3 && <LeftBracket w={'15px'} h={'50px'} girth='5px'></LeftBracket>}
            <Text w={'80%'}>LeaderBoard</Text>
          {tab === 3 && <RightBracket w={'15px'} h={'50px'} girth='5px'></RightBracket>}
        </Tab>

        <Tab bgColor={Constants.TABS_COLOR} border={'none'} borderRadius={'0px'} fontSize={fontSize}
        _selected={{background: Constants.SELECTED_TAB_COLOR}}
        onClick={() => {setTab(4)}} onFocus={() => {setTab(4)}}
        >
          {tab === 4 && <LeftBracket w={'15px'} h={'50px'} girth='5px'></LeftBracket>}
          <Text w={'80%'}>Profile</Text>
          {tab === 4 && <RightBracket w={'15px'} h={'50px'} girth='5px'></RightBracket>}
        </Tab>

      </TabList>

      <TabPanels margin={'0'} padding={'0'}>

        <TabPanel margin={'0'} padding={'0'}>
          <GameBox socket={gameSock}/>
        </TabPanel>

        <TabPanel margin={'0'} padding={'0'}>
          CECI EST UN CHAT
        </TabPanel>

        <TabPanel margin={'0'} padding={'0'}>
          <LeaderBoard/>
        </TabPanel>

        <TabPanel margin={'0'} padding={'0'}>
          CECI EST UN PROFIL
        </TabPanel>

    </TabPanels>
  </Tabs>
  )
}

function App() {
  
  const [cookies, setCookie] = useCookies(["access_token"])
  const [isAuth, setIsAuth] = useState(true)

  console.log('getting there ')
  return (<>
    <ChakraProvider>

      {/* {!isAuth && <Auth isAuthenticated={isAuth} setIsAuthenticated={setIsAuth}/>} */}
      {isAuth && <Malaise/>}
    </ChakraProvider>
  </>
  );
}

export default App;
