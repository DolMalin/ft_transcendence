import React from "react";
import { CloseButton, Flex, Text, ToastId } from "@chakra-ui/react";
import * as Constants from '../game/globals/const'

function BasicToast(props : {text : string,children? : React.ReactNode}) {
    
    return (
        <Flex w={'320px'}
        h={'130px'}
        className='goma'
        bgColor={Constants.BG_COLOR_FADED}
        justifyContent={'space-evenly'}
        alignItems={'center'}
        flex={'row'}
        wrap={'wrap'}
        >
          <Text w={'100%'} textColor={'white'} textAlign={'center'}> {props.text} </Text>
          {props.children}
        </Flex>
    )
}

export default BasicToast