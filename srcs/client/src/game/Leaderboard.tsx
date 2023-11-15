import React, { useEffect, useState } from "react"
import {
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    Button,
    TableCaption,
    TableContainer,
  } from '@chakra-ui/react'
import * as Constants from './const'
import axios from "axios";
import { leaderboardStats } from "./interfaces";


function LeaderBoard() {

    const [scoreList, setScoreList] = useState<leaderboardStats[]>([]);

    async function getScoreList() {
        try {
            const res = await axios.get('http://127.0.0.1:4545/users/scoreList')

            setScoreList(res.data)
            console.log('res :', scoreList);
        }
        catch (err)
        {
            console.log(err);
            setScoreList([])
        }
    }

    useEffect(() => {
        setTimeout(getScoreList, 2000);
        // if (scoreList != [])
        // {
        //     ;
        // }
    }, [scoreList])

    function winRatioCalculator(w : number, l : number) {
        
        if (l === 0 && w === 0)
            return ('0%');
        if (l === 0)
            return ('100%');

        let ratio = w * 100 / (w + l);

        return (ratio.toString() + ' %')
    }
    async function createUser() {
        try {
            const res = await axios.get('http://127.0.0.1:4545/auth/newUserDebug')
        }
        catch (e) {
            console.log(e);
        }
    }

    return (<>
        <Button onClick={createUser}> Create user</Button>
        <Table variant={'striped'}>
            <Thead>
                <Tr>
                    <Th>Username</Th>
                    <Th isNumeric>Wins</Th>
                    <Th isNumeric>Loose</Th>
                    <Th>W/L Ratio</Th>
                </Tr>
            </Thead>
            <Tbody>
                {scoreList.map((value) => {
                    return (<Tr>
                        <Td> {value.username} </Td>
                        <Td isNumeric> {value.winsAmount}</Td>
                        <Td isNumeric> {value.loosesAmount}</Td>
                        <Td > {winRatioCalculator(value.winsAmount, value.loosesAmount)}</Td>
                        </Tr>)
                })}
            </Tbody>
        </Table>
    </>)
  }

  export default LeaderBoard