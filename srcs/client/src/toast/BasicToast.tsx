import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import * as Constants from '../game/globals/const'

function BasicToast(props : {text : string, children? : React.ReactNode}) {
    
    return (
        <Flex w={'320px'}
        h={'120px'}
        className='goma'
        bgColor={Constants.BG_COLOR_FADED}
        justifyContent={'space-evenly'}
        alignItems={'center'}
        flex={'row'}
        wrap={'wrap'}
        >
          <Text textColor={'white'} textAlign={'center'}> {props.text} </Text>
          {props.children}
        </Flex>
    )
}

export default BasicToast