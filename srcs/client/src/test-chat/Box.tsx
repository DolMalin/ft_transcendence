import React,  {useState, KeyboardEvent} from "react";
import * as Chakra from '@chakra-ui/react';

export function Box(){
    return (<>
  <Chakra.Grid
  templateAreas={`"header header"
                  "nav main"
                  "nav footer"`}
  gridTemplateRows={'150% 1fr 150%'}
  gridTemplateColumns={'150% 1fr'}
  h='100%'
  gap='1'
  color='blackAlpha.700'
  fontWeight='bold'
>
  <Chakra.GridItem pl='2' bg='orange.300' area={'header'}>
    Connected user
  </Chakra.GridItem>
  <Chakra.GridItem pl='2' bg='pink.300' area={'nav'}>
    Nav
  </Chakra.GridItem>
  <Chakra.GridItem pl='2' bg='green.300' area={'main'}>
    Chat box
  </Chakra.GridItem>
  <Chakra.GridItem pl='2' bg='blue.300' area={'footer'}>
    chat tools
  </Chakra.GridItem>
</Chakra.Grid>
{/* <Chakra.Box bg='grey' w='100%' p={600} height='' color='white' borderRadius='2%'>
</Chakra.Box> */}
    </>)
}