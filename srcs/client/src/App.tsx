import React, { Profiler, useEffect, useRef, useState } from 'react';

import {CookiesProvider, useCookies}  from 'react-cookie';
import Auth from "./auth/Auth"
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
import axios from 'axios';

const gameSock = io('http://10.14.6.7:4545')

function Malaise() {

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

    gameSock.on('gameStarted', () => {
      
      setSwitchingFrom(true);
      setTab(0)
      // seems pretty weird but on tab change window.inner{Size} is reseted and some Componants depends ont it
      window.dispatchEvent(new Event('resize'))
    })

    return(() => {
      gameSock.off('gameStarted')
    })
  }, [tab, tabsRef?.current?.tabIndex])

  console.log('tab on rerender : ', tab)
  return (
    <Tabs isFitted variant='enclosed' className='goma' ref={tabsRef}
    index={tab} onChange={(index) => {
      switchingFrom ? setTab(0) : setTab(index); 
      setSwitchingFrom(false); 
      // seems pretty weird but on tab change window.inner{Size} is reseted and some Componants depends ont it
      window.dispatchEvent(new Event('resize'));}}
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
          <CreateGame sock={gameSock}/>
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

  return (<>
    <ChakraProvider>

      {!isAuth && <Auth isAuthenticated={isAuth} setIsAuthenticated={setIsAuth}/>}
      {isAuth && <Malaise/>}
    </ChakraProvider>
  </>
  );
}

export default App;
