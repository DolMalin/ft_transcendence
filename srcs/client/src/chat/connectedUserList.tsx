import {
    Box,
    Text,
    List,
    ListItem
} from '@chakra-ui/react'
import React from 'react'
import { Socket } from 'socket.io-client'

export function ConnectedUserList(props : any){

    let list : string [] = [];
    props.socket.emit("getClients");
    props.socket.on("clientList", (clientList : string []) => {
        clientList.forEach(value => {
            list.push(value);
        });
    })
    console.log("LIST IN FRONT ", list)
    return (<>
        <div>
        <Box>
        <Text fontSize="xl" fontWeight="bold" mb="4">
          List of users
        </Text>
        <List spacing={3}>
          {list.map((item, index) => (
            <ListItem
              key={index}
            //   onClick={() => onItemClick(item)}
              cursor="pointer"
              _hover={{ background: 'gray.100' }}
            >
              {item}
            </ListItem>
          ))}
        </List>
      </Box>
        </div>
    </>
    )
}