import React, { useEffect, useState } from "react"
import {
    Table,
    Thead,
    Tbody,
    Link,
    Tr,
    Th,
    Td,
    Box,
    Avatar,
    useDisclosure,
    Button,
  } from '@chakra-ui/react'
import {RepeatIcon} from '@chakra-ui/icons'
import * as Constants from '../game/globals/const'
import { leaderboardStats } from "../game/globals/interfaces";
import authService from "../auth/auth.service";
import ProfileModal from "../profile/ProfileModal";
import { Socket } from "socket.io-client";

function LeaderBoard(props : {gameSock : Socket, chatSocket: Socket}) {

    const [scoreList, setScoreList] = useState<leaderboardStats[]>([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [userId, setUserId] = useState<string>('');

    function sortScoreList(list : leaderboardStats[])
    {
        return (list.sort((a, b) => {
            const Wa = a.winsAmount;
            const Wb = b.winsAmount;

            if (Wa < Wb)
                return (1);
            else if (Wa > Wb)
                return (-1);
            else
            {
                const WLa = a.WLRatio;
                const WLb = b.WLRatio;

                if (WLa < WLb)
                    return (1)
                if (WLa > WLb)
                    return (-1)
                else
                {
                    const totalA = a.winsAmount + a.loosesAmount;
                    const totalB = b.winsAmount + b.loosesAmount;
                    if (totalA < totalB)
                        return (1)
                    if (totalA > totalB)
                        return (-1)
                    else
                        return (0);
                }
            };
        }))
    }

    async function getScoreList() {
        try {
            const res = await authService.get(process.env.REACT_APP_SERVER_URL + '/users/scoreList');
            setScoreList(sortScoreList(res?.data))
        }
        catch (err)
        {
            console.error(`${err.response.data.message} (${err.response.data.error})`)
            setScoreList([])
        }
    }
    useEffect(() => {

        getScoreList();
    }, [])

    function openProfileModal(userId : string) {

        setUserId(userId);
        onOpen();
    }

    return (<>
        <Box
        width={'100%'}
        height={Constants.BODY_HEIGHT}
        display={'flex'}
        alignItems={'center'}
        overflow={'auto'}
        flexWrap={'wrap'}
        background={Constants.BG_COLOR}
        padding={'30px'}
        scrollBehavior={'smooth'}
        >
            <Table w={'100%'}>
                <Thead>
                    <Tr textColor={'white'}>
                        <Th textColor={'white'} >
                            <Button onClick={getScoreList}
                            size={'sm'}
                            bg={Constants.BG_COLOR}
                            _hover={{background : Constants.BG_COLOR}}>
                                <RepeatIcon width={'100%'} height={'100%'} color={'white'}
                                _hover={{color : 'rgba(255, 255, 255, 0.6)'}}
                                _active={{color : 'white'}}/>
                            </Button>
                            <Link href={'https://r.mtdv.me/KF9vP1hDTg'} isExternal>
                                Username
                            </Link>
                        </Th>
                        <Th textColor={'white'}>
                            Wins</Th>
                        <Th textColor={'white'}>Loose</Th>
                        <Th textColor={'white'}>W/L Ratio
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {scoreList.map((value, index) => {

                        return (<Tr key={index}  textColor={index % 2 !== 0 ? 'rgb(220, 220, 220)' : 'rgb(150, 150, 150)'}>
                            <Td display={'flex'} alignItems={'center'} >
                                <Avatar 
                                    size='md'
                                    name={value?.username}
                                    src={process.env.REACT_APP_SERVER_URL + '/users/avatar/' + value?.id}
                                    // marginRight={'10px'}
                                ></Avatar>

                                <Link textAlign={'center'} justifyContent={'center'} onClick={ () => {openProfileModal(value.id)} }> 
                                    {value?.username} 
                                </Link>
                            </Td>
                            <Td> {value?.winsAmount}</Td>
                            <Td> {value?.loosesAmount}</Td>
                            <Td> {value?.WLRatio.toString() + '%'}</Td>
                            </Tr>)
                    })}
                </Tbody>
            </Table>
            <ProfileModal userId={userId} isOpen={isOpen} onClose={onClose} onOpen={onOpen} gameSock={props.gameSock} chatSocket={props.chatSocket}/>
        </Box>
    </>)
  }

  export default LeaderBoard