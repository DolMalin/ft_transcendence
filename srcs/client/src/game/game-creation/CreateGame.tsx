import React from 'react';
import { useEffect, useState, useReducer } from 'react';
import 'reactjs-popup/dist/index.css';
import Game from '../game-display/Game';
import { Socket } from 'socket.io-client';
import PlayBox from './PlayBox';
import VictoryScreen from './VictoryScreen';
import LooseScreen from './LooseScreen';
import GameMode from './GameMode';
import WaitingScreen from './WaitingScreen';
import { Box } from '@chakra-ui/react'
import * as Constants from '../globals/const'
import authService from '../../auth/auth.service';

export type actionType = 
| {type : 'SET_PLAY'; payload :boolean}
| {type : 'SET_GAME_MOD'; payload :boolean}
| {type : 'SET_GAME'; payload :boolean}
| {type : 'SET_WAITING_SCREEN'; payload :boolean}
| {type : 'SET_LF_GAME'; payload :boolean}
| {type : 'SET_L_SCREEN'; payload :boolean}
| {type : 'SET_V_SCREEN'; payload :boolean}
| {type : 'SET_GAME_TYPE'; payload :string};

export type stateType = {
    playButtonVisible : boolean,
    gameModVisible : boolean,
    gameVisible : boolean,
    waitingScreenVisible : boolean,
    lookingForGame : boolean,
    looseScreenVisible : boolean,
    victoryScreenVisible : boolean,
    selectedGameType : string,
}

function CreateGame(props : {sock : Socket}) {
    const [playerId, setPlayerId] = useState("1");
    const [gameRoom, setGameRoom] = useState('');

    const sock : Socket = props.sock;
    
    function reducer(state : stateType, action : actionType) {

        switch(action.type) {
            case 'SET_PLAY': {
                return ({...state, playButtonVisible : action.payload})
            }
            case 'SET_GAME_MOD': {
                return ({...state, gameModVisible : action.payload})
            }
            case 'SET_GAME': {
                return ({...state, gameVisible : action.payload})
            }
            case 'SET_WAITING_SCREEN': {
                return ({...state, waitingScreenVisible : action.payload})
            }
            case 'SET_LF_GAME': {
                return ({...state, lookingForGame : action.payload})
            }
            case 'SET_L_SCREEN': {
                return ({...state, looseScreenVisible : action.payload})
            }
            case 'SET_V_SCREEN': {
                return({...state, victoryScreenVisible : action.payload})
            }
            case 'SET_GAME_TYPE': {
                return ({...state, selectedGameType : action.payload})
            }
        }
        return (state);
    }

    const [state, dispatch] = useReducer(reducer, {
        playButtonVisible : true,
        gameModVisible : false,
        gameVisible : false,
        waitingScreenVisible : false,
        lookingForGame : false,
        looseScreenVisible : false,
        victoryScreenVisible : false,
        selectedGameType : '',
    });

    useEffect (function matchMaking() {
        if (state.lookingForGame === true)
        {
            sock?.emit("joinGame", {gameType : state.selectedGameType});
            dispatch({type : 'SET_GAME_MOD', payload : false});
            dispatch({type : 'SET_WAITING_SCREEN', payload : true});
        }

        sock?.on('roomFilled', ({gameType}) => {

            // console.log('room was filled : ', gameType)
            if (gameType != undefined)
                dispatch({type : 'SET_GAME_TYPE', payload: gameType})
            dispatch({type : 'SET_WAITING_SCREEN', payload : false});
            dispatch({type : 'SET_LF_GAME', payload : false})
            dispatch({type : 'SET_PLAY', payload : false})
            dispatch({type : 'SET_L_SCREEN', payload : false});
            dispatch({type : 'SET_V_SCREEN', payload : false});
            dispatch({type : 'SET_GAME_MOD', payload : false});
            dispatch({type : 'SET_GAME', payload : true});
        })

        sock?.on('playerId', ({id}) => {
            // console.log('getting in id :', id);
            setPlayerId(id);
        })

        sock?.on('roomName', ({roomName}) => {
            // console.log('getting in roomname : ', roomName);

            setGameRoom(roomName);
        })

        return (() => {
            sock?.off('roomFilled');
            sock?.off('roomName');
            sock?.off('playerId');
        })
    }, [state.lookingForGame, props.sock])

    useEffect(() => {
        sock?.on('gameOver', async ({winner}) => {
            try {
                const res = await authService.get('http://127.0.0.1:4545/users/me');
                console.log('res : ', res.data.id, ' winner : ', winner)
                if (res.data.id === winner)
                    dispatch({type : 'SET_V_SCREEN', payload : true});
                else
                    dispatch({type : 'SET_L_SCREEN', payload : true});
                dispatch({type : 'SET_GAME', payload : false});
                authService.patch('http://127.0.0.1:4545/users/updateIsAvailable', {isAvailable : true})
                props.sock.emit('availabilityChange', true);
                
            }
            catch (e) {
                console.log('setting is Available to false returned : ', e.message);
            }
        });


        return (() => {
            sock?.off('gameOver');
        })
    }, [state.gameVisible, state.victoryScreenVisible, state.looseScreenVisible])
    
    return (<>
            <Box id={Constants.GAME_ZONE}
        width={'100vw'}
        height={'96vh'}
        display={'flex'}
        alignItems={'center'}
        justifyContent={'center'}
        overflow={'auto'}
        flexWrap={'wrap'}
        background={Constants.BG_COLOR}
        >
            {state.playButtonVisible && <PlayBox dispatch={dispatch}/>}
            {state.gameModVisible && <GameMode dispatch={dispatch} sock={props.sock}/>}
            {state.waitingScreenVisible && <WaitingScreen dispatch={dispatch} sock={sock} roomName={gameRoom} />}
            {state.gameVisible && <Game gameType={state.selectedGameType} sock={sock} playerId={playerId} gameRoom={gameRoom}/>}
            {state.victoryScreenVisible && <VictoryScreen dispatch={dispatch}/>}
            {state.looseScreenVisible && <LooseScreen dispatch={dispatch}/>}
        </Box>
    </>);
}

export default CreateGame;