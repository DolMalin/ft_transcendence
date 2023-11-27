import axios from 'axios'
import React, { Component, useEffect, useState} from 'react'
import AuthService from './auth.service'
import { Navigate } from "react-router-dom"
import { Button, Link, Input, FormControl, Flex, Box} from '@chakra-ui/react'
import { useForm } from "react-hook-form";



// function Auth(props: {dispatch: Function, state: any}) {
	function Auth(props : {isAuthenticated : boolean, setIsAuthenticated: Function, isRegistered : boolean, setIsRegistered: Function}) {
	const [authUrl, setAuthUrl] = useState('')
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [isRegistered, setIsRegistered] = useState(false)

	// move in service
	const fetchAuthUrl = async () => {
		try {
			const res = await axios.get("http://127.0.0.1:4545/auth/redirect")
			setAuthUrl(res.data.url)
		} catch (err) {
		}
	}


	// @TODO: vrai status code stp
	const validate = async () => {
		try {
			const res = await AuthService.validate()
			props.setIsAuthenticated(true)
			if (res.data?.isRegistered) {
				props.setIsRegistered(true)
				setIsRegistered(true)
			}
			return 200
		} catch (err) {
			props.setIsAuthenticated(false)
			setIsAuthenticated(false)
			return 500
		}
	}

	const logout = () => {
		try {
			AuthService.logout()
			props.setIsAuthenticated(false)
			setIsAuthenticated(false)
		} catch(err) {
		}
	}

	const onSubmit = async (data:any) => {
		try {
			const formData = new FormData()
			formData.append("file", data.avatar[0])
			formData.append("username", data.username)
			await AuthService.register(formData)
			props.setIsRegistered(true)
			setIsRegistered(true)
		} catch(err) {
			console.log(err)
		}
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
		const { register, handleSubmit, formState: { errors } } = useForm();

		console.log('reg')

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
		console.log('logout')
		return (
			<div className="Log">
				<Button fontWeight={'normal'} onClick={logout}>Logout</Button>
			</div>
		)
	}



	useEffect(() => {
        async function asyncWrapper() {
        fetchAuthUrl()
        const status = await validate();
        if (status === 200)
            setIsAuthenticated(true)
        else 
            setIsAuthenticated(false)
    };
    asyncWrapper();
    }, [isAuthenticated, isRegistered])

	return (<>

		{ isAuthenticated && !isRegistered && <RegisterComponent/>}
		{isAuthenticated && <LogoutComponent />}
		{!isAuthenticated && <LoginComponent />}
	</>)
}

export default Auth