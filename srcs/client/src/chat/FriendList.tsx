import { Box, Flex, Link, ListItem, Text, UnorderedList } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import authService from "../auth/auth.service";
import * as Constants from '../game/globals/const'
import { CheckCircleIcon, EmailIcon } from "@chakra-ui/icons";

function FriendList() {
    const [friendsList, setFriendsList] = useState<{
        username : string,
        userId : string,
        isConnected? : boolean, 
        isAvailable : boolean
      }[]>([]);

    return (<>
                <Flex h={'50%'}
            w={'100%'}
            bg={Constants.BG_COLOR}
            padding={'10px'}
            wrap={'nowrap'}
            flexDir={'column'}
            overflowY={'auto'}
            >

            <Text w={'100%'} textAlign={'center'} marginBottom={'10px'}> Friend List </Text>
                {friendsList.map((friend, index) => {

                    let pinColor : string;
                    if (friend.isConnected === true && friend.isAvailable === true)
                        pinColor = 'green';
                    else if (friend.isConnected === true && friend.isAvailable === false)
                        pinColor = 'yellow'
                    else
                        pinColor = 'red';
                    return(
                        <>
                            <Flex width={'100%'} 
                            minH={'45px'}
                            maxWidth={'300px'}
                            marginBottom={'10px'}
                            flexDir={'column'} 
                            alignItems={'center'}
                            bgColor={Constants.BG_COLOR_FADED}
                            >
                                <Flex w={'100%'}
                                flexDir={'row'} 
                                alignItems={'center'}>
                                    <Box padding={'10px'}>
                                        <CheckCircleIcon boxSize={4} color={pinColor}/>
                                    </Box>
                                    <Link overflow={'hidden'} textOverflow={'ellipsis'}> {friend.username} </Link>
                                </Flex>

                                <Flex w={'100%'} justifyContent={'space-evenly'} paddingBottom={'10px'}>
                                    <EmailIcon boxSize={4} color={'white'} //TO DO : if pending message change color to red
                                    _hover={{transform : 'scale(1.2)'}}
                                    />
                                </Flex>
                            </Flex>
                        </>
                    )
                })}

        </Flex>
    </>)
}

export default FriendList