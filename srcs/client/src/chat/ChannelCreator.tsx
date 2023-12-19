import React from "react"
import * as Const from "../game/globals/const"

import { 
    Button,
    useDisclosure,

} from "@chakra-ui/react"
import ChannelCreationModal from "./ChannelCreationModal"
 
function ChannelCreator (){
    const {isOpen, onOpen, onClose} = useDisclosure()

    return (
        <>
           <Button
            fontWeight={'normal'}
            borderRadius={'0px'}
            textAlign={'center'}
            bg={'none'}
            textColor={'white'}
            _hover={{background : 'white', textColor : Const.BG_COLOR}}
            onClick={() => (onOpen())}
            >
                Create channel
            </Button>
            <ChannelCreationModal isOpen={isOpen} onOpen={onOpen} onClose={onClose}/>
        </>
    )
}

export default ChannelCreator