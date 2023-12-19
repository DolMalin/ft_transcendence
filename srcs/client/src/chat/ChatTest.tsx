import { Flex } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import * as Constants from '../game/globals/const'

function ChatTest() {

    type FlexDirection = "column" | "inherit" | "-moz-initial" | "initial" | "revert" | "unset" | "column-reverse" | "row" | "row-reverse" | undefined;

    const [boxWidth, setBoxWidth] = useState(window.innerWidth <= 960 ? '100%' : '15%');
    const [boxHeight, setBoxHeight] = useState(window.innerWidth <= 960 ? 'calc(100% / 3)' : '100%');
    const [flexDir, setFlexDir] = useState<FlexDirection>(window.innerWidth <= 960 ? 'column' : 'row');

    useEffect(function DOMEvents() {

        function debounce(func : Function, ms : number) {
          let timer : string | number | NodeJS.Timeout;
      
          return ( function(...args : any) {
              clearTimeout(timer);
              timer = setTimeout( () => {
                  timer = null;
                  func.apply(this, args)
              }, ms);
          });
        };
    
        const debouncedHandleResize = debounce (function handleResize() {
            if (window.innerWidth <= 960)
            {
                setBoxWidth('100%');
                setBoxHeight('calc(100% / 3)');
                setFlexDir('column');
            }
            else
            {
                setBoxWidth('15%');
                setBoxHeight('100%');
                setFlexDir('row');
            }
            // if (window.innerHeight <= 960 && window.innerWidth <= 960)
            //     setBoxHeight('33%')

        }, 50)
    
        window.addEventListener('resize', debouncedHandleResize)
    
        return(() => {
          window.removeEventListener('resize', debouncedHandleResize)
        })
      }, [])

    return (<>
    <Flex
    w={'100%'}
    h={Constants.BODY_HEIGHT}
    wrap={'nowrap'}
    flexDir={flexDir}
    >

        <Flex
        w={boxWidth}
        h={boxHeight}
        minH={'320px'}
        flexDir={'column'}
        bg='blue' 
        >
            <Flex h={'30%'}
            w={'100%'}
            bg={'cyan'}
            >
                Channel Settings
            </Flex>
            <Flex h={'70%'}
            w={'100%'}
            bg='turquoise'
            >
                Channel List
            </Flex>
        </Flex>

        <Flex
        w={boxWidth === '100%' ? boxWidth : '70%'}
        h={boxHeight}
        minH={'320px'}
        bg='green' 
        >
            ChatBox
        </Flex>

        <Flex
        w={boxWidth}
        h={boxHeight}
        minH={'320px'}
        bg='red'
        flexDir={'column'} 
        >
            <Flex h={'50%'}
            w={'100%'}
            bg={'magenta'}
            >
                User List
            </Flex>
            <Flex h={'50%'}
            w={'100%'}
            bg={'pink'}
            >
                friend List
            </Flex>
        </Flex>
    </Flex>
    </>)
}

export default ChatTest