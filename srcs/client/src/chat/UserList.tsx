import { CheckCircleIcon, EmailIcon } from "@chakra-ui/icons"
import { 
    Flex, 
    Heading, 
    IconButton, 
    Link, 
    ListItem, 
    UnorderedList, 
    useDisclosure,
    Text,
    Box
 } from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import { Socket } from "socket.io-client"
import authService from "../auth/auth.service"
import ProfileModal from "../profile/ProfileModal"
import * as Constants from '../game/globals/const'

async function getUserList(me : {username: string, id: string}){
    let userList: {
        id: string,
        username: string,
        isuser: boolean,
        isLogged: boolean,
        isAvailable: boolean
    }[]
    try{
        const res =  await authService.get(process.env.REACT_APP_SERVER_URL + '/users/')
        userList = res.data
        userList = userList.filter(user => user.id !== me?.id)
    }
    catch(err){
        throw err
    }
    return userList
}

function UserList(props: {chatSocket: Socket}){
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [id, setId] = useState("")
    const [userList, setUserList] = useState
    <{  id: string
        username: string,
        isuser: boolean,
        isLogged: boolean,
        isAvailable: boolean
    }[]>([])
    
    const fetchUserList = async (me : {username: string, id: string}) => {
        try {
            const tab = await getUserList(me)
            setUserList(tab)
        }
        catch(err){
            console.error(`${err.response.data.message} (${err.response?.data?.error})`)
        }
    }

    useEffect(() => {        
        const asyncWrapper = async () => {
                const res = await authService.get(process.env.REACT_APP_SERVER_URL + '/users/me')
                fetchUserList(res.data) 
        }
        asyncWrapper()
    }, [])
    return (<>
        <Flex h={'50%'}
    w={'100%'}
    bg={Constants.BG_COLOR}
    padding={'10px'}
    wrap={'nowrap'}
    flexDir={'column'}
    overflowY={'auto'}
    >

    <Text w={'100%'} textAlign={'center'} marginBottom={'10px'}> user List </Text>
        {userList.map((user, index) => {

            let pinColor : string;
            if (user.isLogged === true && user.isAvailable === true)
                pinColor = 'green';
            else if (user.isLogged === true && user.isAvailable === false)
                pinColor = 'yellow'
            else
                pinColor = 'red';
            return(
                    <Flex 
                    key={index}
                    width={'100%'} 
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
                            <Link overflow={'hidden'} textOverflow={'ellipsis'} onClick={() => {onOpen() ; setId(user.id)}}> {user.username} </Link>
                        </Flex>

                        <Flex w={'100%'} justifyContent={'right'} paddingBottom={'10px'} paddingRight={'10px'}>
                            <EmailIcon boxSize={4} color={'white'} //TO DO : if pending message change color to red
                            _hover={{transform : 'scale(1.2)'}}
                            />
                        </Flex>
                    </Flex>
            )
        })}
        <ProfileModal userId={id} isOpen={isOpen} onClose={onClose} onOpen={onOpen} chatSocket={props.chatSocket}/>
</Flex>
</>)
}


//     return (
//         <>
//         <Flex width='100%' flexDir='column'>
//         <Text fontSize='2xl' textColor='white' paddingBottom='10px' textAlign='center'>User list</Text>
//         {userList?.length > 0 && (
//         userList.map((user, index: number) => (
//             <UnorderedList key={index} width='100%' paddingLeft='10px'>
//                 <ListItem><Link color='white' onClick={() => {onOpen() ; setId(user.id)}}>{user.username} {user.isuser ? "👥" :""}</Link></ListItem>
//                 {/* <IconButton
//                     variant='outline'
//                     colorScheme='teal'
//                     aria-label='Send email'
//                     icon={<EmailIcon />}
//                     onClick={() => {}}
//                 /> */}
//             </UnorderedList>
//         ))
//         )}
//         <ProfileModal userId={id} isOpen={isOpen} onClose={onClose} onOpen={onOpen} chatSocket={props.chatSocket}/>
//         </Flex>
//         </>
//     )
// }

export default UserList