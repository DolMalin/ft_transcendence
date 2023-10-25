import React, { Profiler } from 'react';

import './App.css';
import {CookiesProvider, useCookies}  from 'react-cookie';
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Auth from "./auth/Auth"
import Profile from "./Profile"
import CreateGameButton from './CreateGame';
import { ChakraProvider, Button, ButtonGroup } from '@chakra-ui/react'
import { Socket, io } from 'socket.io-client'
import * as Constants from './const'
import * as dotenv from 'dotenv'

console.log(process.env.SERVER_URL)

function Game(props : {socket : Socket}) {
  return (
    <div className='feur'>
        <div className='sideBar'>
        </div>
        <div className='decor' id={Constants.GAME_ZONE}>
          <CreateGameButton sock={props.socket}/>
        </div>
    </div>
  )
}


function App() {
  
  const gameSock = io(process.env.SERVER_URL)
  const [cookies, setCookie] = useCookies(["access_token"])


  return (

      <ChakraProvider>

        <BrowserRouter>
          <Routes>
            {/* <Route path="/" element={<Auth />} /> */}
            {/* <Route path="/profile" element={<Profile />} /> */}
            <Route path='/' element={<Game socket={gameSock}/>} />
          </Routes>
        </BrowserRouter>      
      </ChakraProvider>

  );
}

export default App;
