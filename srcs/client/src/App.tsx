import React, { useEffect } from 'react';
import {ChakraProvider} from '@chakra-ui/react'
import logo from './logo.svg';
import './App.css';
import {io} from 'socket.io-client';
import { Chatbox } from './chat/Chatbox';
import { ConnectedUserList } from './chat/connectedUserList';

const socket = io('http://localhost:4545');

function App() {
//   useEffect(() => {
//   socket.on('connect', () => {
//     console.log('Connected to server');
//   });

//   socket.on('disconnect', () => {
//     console.log('Disconnected from server');
//   });
//   return () => {
//     socket.disconnect();
//   };
  
// }, []);
  socket.on("DM", (message) => {console.log(message)});
  return (
    <div className="App">
      <header className="App-header">
        <ChakraProvider>
          <ConnectedUserList socket={socket}/>
          <Chatbox socket={socket}/>
        </ChakraProvider>
      </header>
    </div>
  );
}

export default App;
