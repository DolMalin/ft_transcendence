import React, { useEffect, useState } from "react"
import {
    Box,
    Accordion,
    AccordionButton,
    AccordionItem,
    AccordionPanel,
    AccordionIcon,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td
  } from '@chakra-ui/react'
import * as Constants from '../game/globals/const'
import authService from "../auth/auth.service";
import { DBGame } from "../game/globals/interfaces";


function PlayerHistoryAccordion(props : {userId : string}) {
    const [history, setHistory] = useState<DBGame[]>([]);

    async function getHistory(id : string) {
        if (props.userId != undefined)
        {
            try {
                const res = await authService.get('http://127.0.0.1:4545/users/history/' + id);
                setHistory(res.data);
            }
            catch (e) {
                console.log('get History front : ', e)
            }
        }
    }

    useEffect(() => {
        getHistory(props.userId);
    }, [props.userId])

    return (<>
        <Accordion allowToggle 
        marginTop={'40px'}
        maxHeight={'400px'} overflowY={'auto'}> 
            <AccordionItem border={'none'}>
                <h2>
                    <AccordionButton>
                        <Box as="span" flex='1' textAlign='center' fontSize={'1.5em'}>
                            Player History
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                    <Table>
                        <Thead>
                            <Tr>
                                <Th> Player </Th>
                                <Th></Th>
                                <Th> Adversary </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                        {history.map((value, index) => {
                            return (<Tr key={index}>
                                <Td> 
                                    {props.userId === value.winnerId ? value.winnerUsername : value.looserUsername} 
                                </Td>

                                <Td 
                                textColor={props.userId === value.winnerId ? Constants.DARKERKER_BLUE : Constants.DARKERKER_RED}
                                > 
                                    {props.userId === value.winnerId ? "WON TO" : "LOST TO"} 
                                </Td>

                                <Td> 
                                    {props.userId === value.winnerId ? value.looserUsername : value.winnerUsername} 
                                </Td>
                            </Tr>)
                        })}
                        </Tbody>
                    </Table>
                </AccordionPanel>
            </AccordionItem>
        </Accordion>
    </>)
}

export default PlayerHistoryAccordion