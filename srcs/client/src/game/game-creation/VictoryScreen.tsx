import React from "react";
import { Box,
Text,
Button,
 } from "@chakra-ui/react";

 function VictoryScreen (props : {dispatch : Function}) {
// Display new ladder placement
    function closeVScreen() {
        props.dispatch({type : 'SET_V_SCREEN', payload : false})
        props.dispatch({type : 'SET_PLAY', payload : true})
    };
    
    return (<>
        <Box h={'100%'} w={'100%'}
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        justifyContent={'center'}
        textColor={'white'}
        minH={'sm'}
        textAlign={'center'}
        >
            <Text fontSize={'5em'}> YOU WON MICHEL </Text>

            <Button fontWeight={'normal'} size={'3em'} bg={'black'} borderRadius={'0'} fontSize={'3em'}
            _hover={{background : 'white', textColor: 'black'}}
            onClick={closeVScreen}
            >
            Go back ?</Button>
        </Box>
    </>)
}

export default VictoryScreen
