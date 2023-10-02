import React from 'react'
import Phaser from 'phaser'
import { MainScene } from './Game/MainScene'
import { io } from 'socket.io-client'

type AppProps = {}
type AppState = {}

class Game extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props)
        const game = new Phaser.Game({
            parent: 'game',
            type: Phaser.AUTO,
            width:600,
            height:1000,
            scene: [MainScene],
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: {
                        y: 0,
                        x: 0
                    },
                    // debug: true
                }
            }
        })
    }

    render () {
        
        return (<>
        <div id='game'></div>
        </>)
    }
}

export default Game