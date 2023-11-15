import axios from 'axios'
import React, { Component, useEffect, useState} from 'react'
import AuthService from './auth.service'
import { Navigate } from "react-router-dom"
import { Button, Link, Input, FormControl, Flex, Box} from '@chakra-ui/react'



function Auth() {
	const [authUrl, setAuthUrl] = useState('')
	const [isAuthenticated, setIsAuthenticated] = useState(false)
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
		let status = res.status
		if (status === 200)
			setIsAuthenticated(true)
		else if (status === 401 && AuthService.getAccessToken()){
			status = await AuthService.refresh()
			if (status === 200)
				setIsAuthenticated(true)
			else
				setIsAuthenticated(false)
		}
		else
			setIsAuthenticated(false)	
		
		if (res?.data?.isRegistered === true)
			setIsRegistered(true)


		return 200
	}


	const logout = () => {
		AuthService.logout()
		setIsAuthenticated(false)
	}

	const handleSubmit = async (avatar:string, username:string) => {
		console.log(avatar)
		console.log(username)
		console.log(avatar)
		await AuthService.register(avatar, username)
	}



	function LoginComponent() {
		return (
			<div className="Log">
				<Button>
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
				<Button onClick={logout}>Logout</Button>
			</div>
		)
	}

	useEffect(() => {
		fetchAuthUrl()
		validate()
	}, [])


		
	return (<>

		{isAuthenticated && !isRegistered && <RegisterComponent/>}
		{isAuthenticated && <LogoutComponent />}
		{!isAuthenticated && <LoginComponent />}
		{/* {username} */}
	</>)
}

export default Auth