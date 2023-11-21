import React from "react";
import { Box} from "@chakra-ui/react"

export function LeftBracket(props : {w : string, h : string, girth : string}) {
    return (
        <Box w={props.w} h={props.h}
            content='  '
            border={'10px solid white'}
            borderWidth={props.girth}
            borderRight={'none'}
            marginRight={'10px'}
            padding={'8px 5px 8px 5px'}
        ></Box>
    )
}

export function RightBracket(props : {w : string, h : string, girth : string}) {
    return (
        <Box w={props.w} h={props.h}
            content='  '
            border={'10px solid white'}
            borderWidth={props.girth}
            borderLeft={'none'}
            marginLeft={'10px'}
            padding={'8px 5px 8px 5px'}
        ></Box>
    )
}