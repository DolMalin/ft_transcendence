import React, { Profiler, useState } from 'react';

import './App.css';
import {CookiesProvider, useCookies}  from 'react-cookie';
import Auth from "./auth/Auth"
import Profile from "./Profile"
import CreateGameButton from './game/CreateGame';
import { ChakraProvider, Box } from '@chakra-ui/react'
import { Socket, io } from 'socket.io-client'
import * as Constants from './game/const'
import LeaderBoard from './game/Leaderboard';

const gameSock = io('http://localhost:4545')

function Game(props : {socket : Socket}) {
  return (
        <Box id={Constants.GAME_ZONE}
        width={'100vw'}
        height={'100vh'}
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        justifyContent={'center'}
        overflow={'scroll'}
        background='pink'>
          <CreateGameButton sock={props.socket}/>
        </Box>
  )
}

function App() {
  
  const [cookies, setCookie] = useCookies(["access_token"])
  const [isAuth, setIsAuth] = useState(false)

  console.log(isAuth);

  return (

      <ChakraProvider>
            <Auth isAuthenticated={isAuth} setIsAuthenticated={setIsAuth}/>
            <LeaderBoard />
            {/* <Game socket={gameSock}/>
            {/* {!isAuth && <Auth isAuthenticated={isAuth} setIsAuthenticated={setIsAuth}/>}
            {isAuth && <Game socket={gameSock}/>} */}
            
      </ChakraProvider>

  );
}

export default App;
