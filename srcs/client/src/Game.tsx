import React from 'react';
import './App.css';
import Konva from 'konva';
import { Stage, Layer, Text, Star } from 'react-konva';

export function Game() {

  
  return (
    <div className='w-1'>
      <Stage width={window.innerWidth / 2} height={window.innerHeight / 2} color={'blue'}>
        <Layer>
          
        </Layer>
      </Stage>
    </div>
  );
};

export default Game;
