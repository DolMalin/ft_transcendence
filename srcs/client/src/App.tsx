import React, { Profiler } from 'react';

import './App.css';
import {CookiesProvider, useCookies}  from 'react-cookie';
import Auth from "./auth/Auth"
import CreateGameButton from './game/CreateGame';
import { ChakraProvider, Button, ButtonGroup, Box } from '@chakra-ui/react'
import { Socket, io } from 'socket.io-client'
import * as Constants from './game/const'
import * as dotenv from 'dotenv'

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

  return (<>
    <ChakraProvider>
      <Auth />
    </ChakraProvider>
  </>
  );
}

export default App;
