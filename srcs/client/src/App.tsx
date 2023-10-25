import React, { Profiler } from 'react';
import logo from './logo.svg';

import './App.css';
import {CookiesProvider, useCookies}  from 'react-cookie';
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Auth from "./auth/Auth"
import Profile from "./Profile"
import CreateGameButton from './CreateGame';
import { ChakraProvider, Button, ButtonGroup } from '@chakra-ui/react'
import { Socket, io } from 'socket.io-client'
import * as Constants from './const'

const gameSock = io('http://localhost:4545')

function App() {

  const [cookies, setCookie] = useCookies(["access_token"])


  return (
      <ChakraProvider>
            <div className='sideBar'>
            </div>
            <div className='decor' id={Constants.GAME_ZONE}>
              <CreateGameButton sock={gameSock}/>
            </div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </BrowserRouter>      
      </ChakraProvider>

  );
}

export default App;
