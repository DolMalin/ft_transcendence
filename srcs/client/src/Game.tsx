import React from 'react'
import { useRef, useEffect } from 'react'
import { io } from 'socket.io-client'

const sock = io('http://localhost:4545')

function Game(props : any) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
      
        context.fillStyle = 'green';
        context.fillRect(0, 0, props.width / 0.5, props.height / 2);
    }, []);

    return (<>
    <canvas ref={canvasRef} width={props.width} height={props.height}> feur </canvas>
    </>)
}

export default Game