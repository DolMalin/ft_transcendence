import React, { Profiler } from 'react';
import logo from './logo.svg';

import './App.css';
import {CookiesProvider, useCookies}  from 'react-cookie';
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Auth from "./Auth"
import Profile from "./Profile"

function App() {

  const [cookies, setCookie] = useCookies(["access_token"])


  return (
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>      

  );
}

export default App;
