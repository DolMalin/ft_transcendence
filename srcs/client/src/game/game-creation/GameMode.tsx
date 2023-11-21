import React from "react";
import { Box,
Button,
Flex,
Divider,
 } from "@chakra-ui/react"
import * as Constants from '../const'
import { LeftBracket, RightBracket } from "./Brackets";

function GameMode(props : {dispatch : Function}) {

    return (<>
        <Flex flexDir={'column'} wrap={'nowrap'}
            alignItems={'center'}
            justifyContent={'center'}
        >
            <Box h={'lg'} w={'lg'}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            >
                <Box width={'sm'} height={'sm'}
                display={'flex'} flexDir={'row'} 
                alignItems={'center'} justifyContent={'center'}
                >
                    <LeftBracket w={'30px'} h={'150px'} girth={'10px'}/>

                    <Button
                    fontSize={'2xl'}
                    textColor={'white'}
                    bgColor={'black'}
                    fontWeight={'normal'}
                    h={'100px'}
                    borderRadius={'0px'}
                    _hover={{background : 'white', textColor: 'black'}}
                    onClick={() => {props.dispatch({type : 'SET_GAME_TYPE', payload : Constants.GAME_TYPE_ONE}); 
                    props.dispatch({type : 'SET_LF_GAME', payload : true})}}> 
                        {Constants.GAME_TYPE_ONE} 
                    </Button>

                    <RightBracket w={'30px'} h={'150px'} girth={'10px'}/>
                </Box>
            </Box>
            
            <Flex flexDir={'row'} width={'100%'}
                alignItems={'center'}
                justifyContent={'center'}
            >
                <Divider variant={'dashed'} w={'35%'}/>
                <Button w='20%' margin='5%'
                borderRadius={'0'}
                bg={'black'} 
                textColor={'white'} 
                fontWeight={'normal'}
                _hover={{background : 'white', textColor: 'black'}}
                onClick={() => {
                    props.dispatch({type : 'SET_GAME_MOD', payload : false});
                    props.dispatch({type : 'SET_PLAY', payload : true});
                }}> Go back !</Button>
                <Divider variant={'dashed'} w={'35%'}/>
            </Flex>

            <Box h={'lg'} w={'lg'}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            >
                <Box width={'sm'} height={'sm'}
                display={'flex'} flexDir={'row'} 
                alignItems={'center'} justifyContent={'center'}
                >
                    <LeftBracket w={'30px'} h={'150px'} girth={'10px'}/>

                    <Button
                    fontSize={'2xl'}
                    fontWeight={'normal'}
                    textColor={'white'}
                    bgColor={'black'}
                    h={'100px'}
                    borderRadius={'0px'}
                    _hover={{background : 'white', textColor: 'black'}}
                    onClick={() => {props.dispatch({type : 'SET_GAME_TYPE', payload : Constants.GAME_TYPE_ONE}); 
                    props.dispatch({type : 'SET_LF_GAME', payload : true})}}>
                        {Constants.GAME_TYPE_TWO}
                    </Button>

                    <RightBracket w={'30px'} h={'150px'} girth={'10px'}/>
                </Box>
            </Box>
        </Flex>
    </>)
}

export default GameMode