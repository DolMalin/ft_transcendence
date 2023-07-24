import React from 'react';
import './App.css';
import Konva from 'konva';
import { Stage, Layer, Text, Star } from 'react-konva';

export function Game() {

  
  return (
    <Stage className='test' width={window.innerWidth / 2} height={window.innerHeight / 2}>
      <Layer>
      <Star
            key={1}
            id={'feur'}
            x={100}
            y={100}
            numPoints={5}
            innerRadius={20}
            outerRadius={40}
            fill="#89b717"
            opacity={0.8}
            draggable
          />
      </Layer>
    </Stage>
  );
};

export default Game;
