
import React, { useEffect } from 'react';
import './App.css';
import io from 'socket.io-client'

let sock = io('http://localhost:4545')

function Socket () {
    useEffect(() => {
        sock.on("connect", connectEvent);
        return () => {
            sock.off("connect", connectEvent);
        }
    })

    const emitEvent = () => {
        sock.emit("eventtt", {data: "feur"});
    }

    const connectEvent = () => {
        console.log("connected", sock.id);
    }

    return (<p>
    <button onClick={emitEvent}> salut </button>
    </p>)
}

export default Socket;

