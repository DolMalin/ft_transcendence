import React, { Profiler } from 'react';
import logo from './logo.svg';

import './App.css';
import {CookiesProvider, useCookies}  from 'react-cookie';
import Auth from "./auth/Auth"
import { ChakraProvider } from '@chakra-ui/react'

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
