import axios from 'axios'
import React, { Component, useEffect, useState} from 'react'
import AuthService from './auth.service'
import { Navigate } from "react-router-dom"
import { Button, Link, Input, FormControl, Flex, Box} from '@chakra-ui/react'
import { useForm } from "react-hook-form";



	function Auth(props : {
		isAuthenticated : boolean,
		setIsAuthenticated: Function,
		isRegistered : boolean,
		setIsRegistered: Function,
		isTwoFactorAuthenticated: boolean,
		setIsTwoFactorAuthenticated: Function,
		isTwoFactorAuthenticationEnabled: boolean
		setIsTwoFactorAuthenticationEnabled: Function
	}) {
	const [authUrl, setAuthUrl] = useState('')
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [isRegistered, setIsRegistered] = useState(false)
	const [isTwoFactorAuthenticated, setIsTwoFactorAuthenticated] = useState(false)
	const [isTwoFactorAuthenticationEnabled, setIsTwoFactorAuthenticationEnabled] = useState(false)
	
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

			props.setIsRegistered(res.data?.isRegistered)
			setIsRegistered(res.data?.isRegistered)

			props.setIsTwoFactorAuthenticationEnabled(res.data?.isTwoFactorAuthenticationEnabled)
			setIsTwoFactorAuthenticationEnabled(res.data?.isTwoFactorAuthenticationEnabled)

			setIsTwoFactorAuthenticated(res.data?.isTwoFactorAuthenticated)
			props.setIsTwoFactorAuthenticated(res.data?.isTwoFactorAuthenticated)

			return 200
		} catch (err) {
			props.setIsAuthenticated(false)
			props.setIsTwoFactorAuthenticated(false)
			setIsAuthenticated(false)
			return 500
		}
	}

	const logout = () => {
		try {
			AuthService.logout()
			props.setIsAuthenticated(false)
			setIsAuthenticated(false)
			props.setIsTwoFactorAuthenticated(false)
			setIsTwoFactorAuthenticated(false)
		} catch(err) {
		}
	}

	const onSubmit2fa = async (data:any) => {
		try {
			await AuthService.twoFactorAuthenticationLogin(data.twoFactorAuthenticationCode)
			props.setIsTwoFactorAuthenticated(true)
			setIsTwoFactorAuthenticated(true)
		} catch(err) {
			console.log(err)
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

	function enableTwoFactorAuthenticationComponent() {
		
	}

	function TwoFactorAuthenticationComponent() {
		const { register, handleSubmit, formState: { errors } } = useForm();

		return (
			<Flex width="half" align="center" justifyContent="center">
				<Box p={2}>
					<form onSubmit={handleSubmit(onSubmit2fa)}>
						<FormControl isRequired>
							<Input
								type="text"
								placeholder="2fa code"
								{
									...register("twoFactorAuthenticationCode", {
										required: "enter 2facode",
										minLength: 3,
										maxLength: 80
									})
								}
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
    }, [isAuthenticated, isRegistered, isTwoFactorAuthenticated])

	return (<>
		{isAuthenticated && (!isTwoFactorAuthenticated && isTwoFactorAuthenticationEnabled) && <TwoFactorAuthenticationComponent />}
		{ isAuthenticated && !isRegistered && <RegisterComponent/>}
		{!isAuthenticated && <LoginComponent />}
	</>)
}

export default Auth