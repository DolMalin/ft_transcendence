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
  } from '@chakra-ui/react'
import * as Constants from '../game/globals/const'
import { leaderboardStats } from "../game/globals/interfaces";
import authService from "../auth/auth.service";
import ProfileModal from "./ProfileModal";

function LeaderBoard() {

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
            const res = await authService.get('http://127.0.0.1:4545/users/scoreList');
            setScoreList(sortScoreList(res?.data))
        }
        catch (err)
        {
            console.log(err);
            setScoreList([])
        }
    }
    useEffect(() => {

        getScoreList();
    })

    // setTimeout(getScoreList, 2000);

    function openProfileModal(userId : string) {

        setUserId(userId);
        onOpen();
    }

    return (<>
        <Box
        width={'100vw'}
        height={'96vh'}
        display={'flex'}
        alignItems={'center'}
        justifyContent={'center'}
        overflow={'auto'}
        flexWrap={'wrap'}
        background={Constants.BG_COLOR}
        padding={'30px'}
        >
            <Table w={'90%'}>
                <Thead>
                    <Tr textColor={'white'}>
                        <Th textColor={'white'} >
                            <Link href={'https://r.mtdv.me/KF9vP1hDTg'} isExternal>
                                Username
                            </Link>
                        </Th>
                        <Th textColor={'white'}>Wins</Th>
                        <Th textColor={'white'}>Loose</Th>
                        <Th textColor={'white'}>W/L Ratio</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {scoreList.map((value, index) => {

                        return (<Tr key={index}  textColor={index % 2 !== 0 ? 'rgb(220, 220, 220)' : 'rgb(150, 150, 150)'}>
                            <Td display={'flex'} alignItems={'center'} >
                                <Avatar 
                                    size='md'
                                    name={'avatar'}
                                    src={'http://127.0.0.1:4545/users/avatar/' + value?.id}
                                    marginRight={'10px'}
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
            <ProfileModal userId={userId} isOpen={isOpen} onClose={onClose} onOpen={onOpen}/>
        </Box>


    </>)
  }

  export default LeaderBoard