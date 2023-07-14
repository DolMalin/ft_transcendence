import React from 'react';
import './App.css';

export function Game() {
  return (
    <section className="section">
    <div className="columns is-mobile is-centered">
      <div className="column is-half is-centered has-background-primary">
          <canvas id="myCanvas" width="100%" height="600"></canvas>
      </div>
    </div>
  </section>
  );
};

export default Game;
