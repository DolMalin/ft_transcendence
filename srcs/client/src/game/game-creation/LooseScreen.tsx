import React from "react";
import { Box,
Text,
Button,
 } from "@chakra-ui/react"
import * as Constants from '../globals/const'


function LooseScreen (props : {dispatch : Function}) {
    // Display new ladder placement
    function closeVScreen() {
        props.dispatch({type : 'SET_L_SCREEN', payload : false})
        props.dispatch({type : 'SET_PLAY', payload : true})
    };

    return (<>
        <Box h={'100%'} w={'100%'}
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        justifyContent={'center'}
        overflow={'auto'}
        textColor={'white'}
        minH={'sm'}
        textAlign={'center'}
        >
            <Text fontSize={'5em'}> YOU LOST </Text>

            <Button fontWeight={'normal'} textColor={Constants.HIDDEN_FONT_COLOR} 
            size={'2em'} bg={Constants.BG_COLOR} fontSize={'2em'}
            borderRadius={'0'}
            textOverflow={'clip'}
            onClick={closeVScreen}
            >
            GO BACK</Button>
        </Box>
    </>)
}

export default LooseScreen