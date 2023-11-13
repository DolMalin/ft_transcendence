import './App.css';
import React, { useEffect } from 'react';
import Auth from "./auth/Auth"
import {ChakraProvider} from '@chakra-ui/react'
import {io} from 'socket.io-client';
import { Chat } from './chat/Chat';

const socket = io('http://localhost:4545');

function App() {
  
  socket.on("DM", (message) => {console.log(message)});
  return (
    <div className="App">
      <header className="App-header">
        <ChakraProvider>
            {/* <Auth /> */}
          <Chat socket={socket}/>
          </ChakraProvider>
      </header>
    </div>
  );
}

export default App;
