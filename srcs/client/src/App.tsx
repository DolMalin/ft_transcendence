import React from 'react';
import './App.css';
import Game from './Game'
import CreateGameButton from './CreateGame';
import { ChakraProvider, Button, ButtonGroup } from '@chakra-ui/react'

function App() {
  return (
    <div>
      <header>
        <ChakraProvider>
          <CreateGameButton />
          {/* <Game width={window.innerWidth} height={window.innerHeight}/> */}
        </ChakraProvider>

      </header>
    </div>
  );
}

export default App;
