import React from 'react';
import { useRef, useEffect, useState } from 'react';
import 'reactjs-popup/dist/index.css';
import { ChakraProvider,
Button,
ButtonGroup,
Radio,
RadioGroup,
CloseButton,
Stack } from '@chakra-ui/react';
import Game from './Game';


function CreateGameButton() {
    const buttonRef = useRef(null);
    const [formVisible, setFormVisible] = useState(false);
    const [gameVisible, setGameVisible] = useState(false);
    const [selectedGameType, setSelectedGameType] = useState('');
    
    const toggleForm = () => {
        if(formVisible == false)
            setFormVisible(true);
        else
            setFormVisible(false);
    }

    const toggleGame = () => {
        if (gameVisible)
            setGameVisible(false);
        else
        {
            toggleForm()
            setGameVisible(true);
        }
    }
    
    function Form() {
    
        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            setSelectedGameType(event.target.value);
        };
        return(
            <RadioGroup>
                <CloseButton onClick={toggleForm} alignItems={'right'}></CloseButton>
                <Stack direction='column'>
                    <Radio value='1' checked={selectedGameType === '1'} onChange={handleChange}> type de game 1 </Radio>
                    <Radio value='2' checked={selectedGameType === '2'} onChange={handleChange}> type de game 2 </Radio>
                    <Radio value='3' checked={selectedGameType === '3'} onChange={handleChange}> type de game 3 </Radio>
    
                    <Button onClick={toggleGame} alignItems={'center'}> Launch {selectedGameType} </Button>
                </Stack>
            </RadioGroup>
        );
    }

    return (<>
        {!gameVisible && <Button onClick={toggleForm}> Play</Button>}
        {formVisible && <Form />}
        {gameVisible && <Game width={window.innerWidth / 2} height={window.innerHeight / 2} gameType={selectedGameType}/>}
        {gameVisible && <Button onClick={toggleGame}> Leave </Button>}
    </>);
}

export default CreateGameButton;