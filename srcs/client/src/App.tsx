import React, { Profiler } from 'react';
import logo from './logo.svg';

import './App.css';
import {CookiesProvider, useCookies}  from 'react-cookie';
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Auth from "./auth/Auth"

function App() {

  const [cookies, setCookie] = useCookies(["access_token"])

  return (<>
    {<Auth />}
  </>
  );
}

export default App;
