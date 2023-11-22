import axios from 'axios'
import React, { Component, useEffect, useState} from 'react'
import AuthService from './auth.service'
import { Navigate } from "react-router-dom"
import { Button, Link, Input, FormControl, Flex, Box} from '@chakra-ui/react'
import { useForm } from "react-hook-form";



function Auth(props : {isAuthenticated : boolean, setIsAuthenticated: Function}) {
	const [authUrl, setAuthUrl] = useState('')
	// const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [isRegistered, setIsRegistered] = useState(false)

	// move in service
	const fetchAuthUrl = async () => {
		try {
			const res = await axios.get("http://127.0.0.1:4545/auth/redirect")
			setAuthUrl(res.data.url)
		} catch (err) {
		}
	}

	const validate = async () => {
		try {
			const res = await AuthService.validate()
			props.setIsAuthenticated(true)
			if (res.data?.isRegistered)
				setIsRegistered(true)
		} catch (err) {
			props.setIsAuthenticated(false)
		}
	}

	const logout = () => {
		try {
			AuthService.logout()
			props.setIsAuthenticated(false)
		} catch(err) {
		}
	}

	const onSubmit = async (data:any) => {
		try {
			const formData = new FormData()
			formData.append("file", data.avatar[0])
			formData.append("username", data.username)
			await AuthService.register(formData)
			setIsRegistered(true)
		} catch(err) {
			console.log(err)
		}
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
		const { register, handleSubmit, formState: { errors } } = useForm();

		return (
			<Flex width="half" align="center" justifyContent="center">
				<Box p={2}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<FormControl isRequired>
							<Input
								type="text"
								placeholder="Nom d'utilisateur"
								{
									...register("username", {
										required: "Please enter first name",
										minLength: 3,
										maxLength: 80
									})
								}
							/>

						</FormControl>

						<FormControl isRequired>
							<Input
								height="100%"
								width="100%"
								type="file"
								{
									...register("avatar", {
										required: "Please enter avatar",
									})
								}
								accept="image/*"
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
	</>)
}

export default Auth