import React from 'react';
import './App.css';
import Game from './Game'
import Socket from './Socket';

function App() {
  return (
    <div>
      <header>
        <Socket />
        <Game />
      </header>
    </div>
  );
}

export default App;
