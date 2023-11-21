import React, { Profiler, useState } from 'react';

import './App.css';
import {CookiesProvider, useCookies}  from 'react-cookie';
import Auth from "./auth/Auth"
import CreateGameButton from './game/CreateGame';
import { 
  ChakraProvider, 
  Box,
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

const gameSock = io('http://localhost:4545')

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
        background={'black'}
        >
          <CreateGameButton sock={props.socket}/>
        </Box>
  )
}

function Malaise() {

  return (
    <Tabs isFitted variant='enclosed' className='goma'>

      <TabList border='none' mb='1em' margin={'0'} padding={'0'} height={'4vh'} minH={'40px'} textColor={'white'} className='goma' overflowX={'auto'} overflowY={'clip'}>
        <Tab bgColor={Constants.TABS_COLOR} border={'none'} borderRadius={'0px'}
        _selected={{borderBottomRadius : '5px', background: Constants.SELECTED_TAB_COLOR, transform: 'scale(1.2)'}}>Pong</Tab>

        <Tab bgColor={Constants.TABS_COLOR} border={'none'} borderRadius={'0px'}
        _selected={{background: Constants.SELECTED_TAB_COLOR, transform: 'scale(1.2)'}}>Chat</Tab>

        <Tab bgColor={Constants.TABS_COLOR} border={'none'} borderRadius={'0px'}
        _selected={{background: Constants.SELECTED_TAB_COLOR, transform: 'scale(1.2)'}}>LeaderBoard</Tab>

        <Tab bgColor={Constants.TABS_COLOR} border={'none'} borderRadius={'0px'}
        _selected={{background: Constants.SELECTED_TAB_COLOR, transform: 'scale(1.2)'}}>Profile</Tab>
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
  const [isAuth, setIsAuth] = useState(false)


  return (<>
    <ChakraProvider>

      {!isAuth && <Auth isAuthenticated={isAuth} setIsAuthenticated={setIsAuth}/>}
      {isAuth && <Malaise/>}
    </ChakraProvider>
  </>
  );
}

export default App;
