import React, { useEffect } from 'react';
import './App.css';
import Game from './Game'
import CreateGameButton from './CreateGame';
import { ChakraProvider, Button, ButtonGroup } from '@chakra-ui/react'
import { Socket, io } from 'socket.io-client'

const gameSock = io('http://localhost:4545')

function App() {

  //TO DO : need to reconnect the socket on refresh
  //use JWT token, need Paul intake

  // useEffect(() => {
  //   window.addEventListener('beforeunload', () => {
  //     gameSock.disconnect();
  //   });
  // }, []);
  return (
    <div>
      <header>
        <ChakraProvider>
          <CreateGameButton sock={gameSock}/>
        </ChakraProvider>
      </header>
    </div>
  );
}

export default App;
