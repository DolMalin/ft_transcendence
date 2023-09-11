import React from 'react';
import logo from './logo.svg';

import './App.css';
import Log from './Log';
import Protect from './Protect';
import {CookiesProvider, useCookies}  from 'react-cookie';

function App() {

  const [cookies, setCookie] = useCookies(["access_token"])


  return (
        <div className="App">
          {cookies.access_token}
          { cookies.access_token ? (
            <div>Hello, world!</div>
          ) : (
            <Log />
            )}
            <Protect />
        </div>

  );
}

export default App;
