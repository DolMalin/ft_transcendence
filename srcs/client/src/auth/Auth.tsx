import axios from 'axios'
import React, { Component, useEffect, useState} from 'react'
import AuthService from './auth.service'
import { Navigate } from "react-router-dom"
import { Button, Link, Input, FormControl, Flex, Box} from '@chakra-ui/react'



function Auth(props : {isAuthenticated : boolean, setIsAuthenticated: Function}) {
	const [authUrl, setAuthUrl] = useState('')
	// const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [isRegistered, setIsRegistered] = useState(false)


	const fetchAuthUrl = async () => {
		try {
			const res = await axios.get("http://127.0.0.1:4545/auth/redirect")
			setAuthUrl(res.data.url)
		} catch (err) {
			console.error(err)
		}
	}

	const validate = async () => {
		let res = await AuthService.validate()
		let status = res
		if (status === 200)
			props.setIsAuthenticated(true)
		else if (status === 401 && AuthService.getAccessToken()){
			status = await AuthService.refresh()
			if (status === 200)
				props.setIsAuthenticated(true)
			else
				props.setIsAuthenticated(false)
		}
		else
			props.setIsAuthenticated(false)	
		
		if (res?.data?.isRegistered === true)
			setIsRegistered(true)


		return 200
	}


	const logout = () => {
		AuthService.logout()
		props.setIsAuthenticated(false)
	}

	const handleSubmit = async (avatar:string, username:string) => {
		// console.log(avatar)
		// console.log(username)
		// console.log(avatar)
		await AuthService.register(avatar, username)
	}



	function LoginComponent() {
		return (
			<div className="Log">
				<Button fontWeight={'normal'}>
					<Link href={authUrl}>Log in with 42</Link>
			</Button>
			</div>
		)
	}

	function RegisterComponent() {
		const [username, setUsername] = useState('')
		const [avatar, setAvatar] = useState('')

		return (
			<Flex width="half" align="center" justifyContent="center">
				<Box p={2}>
					<form onSubmit={async () => await handleSubmit(avatar, username)}>
						<FormControl isRequired>
							<Input
								type="text"
								placeholder="Nom d'utilisateur"
								onChange={ event => {setUsername(event.currentTarget.value)}}
							/>

						</FormControl>

						<FormControl isRequired>
							<Input
								type="file"
								height="100%"
								width="100%"
								accept="image/*"
								onChange={event => {setAvatar(event.currentTarget.value)}}
							/>
						</FormControl>
						
						<Button
							fontWeight={'normal'}
							mt={4}
							colorScheme='teal'
							type='submit'
						>
							Submit
						</Button>
					</form>
				</Box>
			</Flex>
		)
	}

	function LogoutComponent() {
		return (
			<div className="Log">
				<Button fontWeight={'normal'} onClick={logout}>Logout</Button>
			</div>
		)
	}

	useEffect(() => {
		fetchAuthUrl()
		validate()
	}, [])


	// console.log(props.isAuthenticated);
	return (<>

		{props.isAuthenticated && !isRegistered && <RegisterComponent/>}
		{props.isAuthenticated && <LogoutComponent />}
		{!props.isAuthenticated && <LoginComponent />}
		{/* {username} */}
	</>)
}

export default Auth