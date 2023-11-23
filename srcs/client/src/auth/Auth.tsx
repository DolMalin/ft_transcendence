import axios from 'axios'
import React, { Component, useEffect, useState} from 'react'
import AuthService from './auth.service'
import { Navigate } from "react-router-dom"
import { Button, Link, Input, FormControl, Flex, Box} from '@chakra-ui/react'



function Auth(props : {isAuthenticated : boolean, setIsAuthenticated: Function, isReg : boolean, setIsReg : Function}) {
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
		let status = res
		if (status === 200)
			props.setIsAuthenticated(true)
		else if (status === 401 && AuthService.getAccessToken()){
			status = await AuthService.refresh()
			if (status === 200)
				props.setIsAuthenticated(true)
			else
			{
				props.setIsAuthenticated(false)
				return (100);
			}
		}
		else
		{
			props.setIsAuthenticated(false)	
			return (100);
		}
		
		if (res?.data?.isRegistered === true)
			props.setIsReg(true)


		return 200
	}


	const logout = () => {

		console.log('logout ?')

		AuthService.logout()
		props.setIsAuthenticated(false)
		setIsAuthenticated(false);
	}

	const handleSubmit = async (avatar:string, username:string) => {
		// console.log(avatar)
		// console.log(username)
		// console.log(avatar)
		await AuthService.register(avatar, username)
		setIsRegistered(true);
		props.setIsReg(true);
	}



	function LoginComponent() {
		console.log('login, is auth : ', props.isAuthenticated)
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

		console.log('reg')

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
		console.log('logout')
		return (
			<div className="Log">
				<Button fontWeight={'normal'} onClick={logout}>Logout</Button>
			</div>
		)
	}

	useEffect(() => {
		async function feur() {
		fetchAuthUrl()
		let res = await validate();
		console.log('res : ',res)
		if (res === 200)
		{
			setIsAuthenticated(true)
			// props.setIsAuthenticated(true)
		}
		else 
		{
			setIsAuthenticated(false)
			// props.setIsAuthenticated(false)
		}
	};
	feur();
	}, [isAuthenticated, isRegistered])


	console.log('is auth : ', isAuthenticated, 'is reg : ', isRegistered);
	return (<>

		{isAuthenticated && !isRegistered && <RegisterComponent/>}
		{isAuthenticated && <LogoutComponent />}
		{!isAuthenticated && <LoginComponent />}
		{/* {username} */}
	</>)
}

export default Auth