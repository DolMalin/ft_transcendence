import { EmailIcon } from "@chakra-ui/icons"
import { 
    Flex, 
    Heading, 
    IconButton, 
    Link, 
    ListItem, 
    UnorderedList, 
    useDisclosure,
    Text
 } from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import { Socket } from "socket.io-client"
import authService from "../auth/auth.service"
import ProfileModal from "../profile/ProfileModal"

async function getUserList(me : {username: string, id: string}){
    let userList: {
        id: string,
        username: string,
        isFriend: boolean}[]
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
    isFriend: boolean}[]>([])
    
    const fetchUserList = async (me : {username: string, id: string}) => {
        try {
            const tab = await getUserList(me)
            setUserList(tab)
        }
        catch(err){
            console.error(`${err.response.data.message} (${err.response.data.error})`)
        }
    }

    useEffect(() => {        
        const asyncWrapper = async () => {
            try{
                const res = await authService.get(process.env.REACT_APP_SERVER_URL + '/users/me')
                fetchUserList(res.data) 
            }
            catch(err){
                console.error(`${err.response.data.message} (${err.response.data.error})`)} 
        }
        asyncWrapper()
    }, [])

    return (
        <>
        <Flex width='100%' flexDir='column'>
        <Text fontSize='2xl' textColor='white' paddingBottom='10px' textAlign='center'>User list</Text>
        {userList?.length > 0 && (
        userList.map((user, index: number) => (
            <UnorderedList key={index} width='100%' paddingLeft='10px'>
                <ListItem><Link color='white' onClick={() => {onOpen() ; setId(user.id)}}>{user.username} {user.isFriend ? "👥" :""}</Link></ListItem>
                {/* <IconButton
                    variant='outline'
                    colorScheme='teal'
                    aria-label='Send email'
                    icon={<EmailIcon />}
                    onClick={() => {}}
                /> */}
            </UnorderedList>
        ))
        )}
        <ProfileModal userId={id} isOpen={isOpen} onClose={onClose} onOpen={onOpen} chatSocket={props.chatSocket}/>
        </Flex>
        </>
    )
}

export default UserList