import axios from 'axios'
import React, { Component, useEffect, useState, useReducer} from 'react'
import AuthService from './auth.service'
import { Navigate } from "react-router-dom"
import { Button, Link, Input, FormControl, Flex, Box} from '@chakra-ui/react'
import { useForm } from "react-hook-form";
import reducer, {stateType} from './components/reducer'


function Auth(props : {state: stateType, dispatch: Function}) {
	const [authUrl, setAuthUrl] = useState('')

	const [state, dispatch] = useReducer(reducer, {
		isAuthenticated: props.state.isAuthenticated,
		isRegistered: props.state.isRegistered,
		isTwoFactorAuthenticated: props.state.isTwoFactorAuthenticated,
		isTwoFactorAuthenticationEnabled: props.state.isTwoFactorAuthenticationEnabled
	  })
	
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
			props.dispatch({type: 'SET_IS_AUTHENTICATED', payload: true})
			dispatch({type: 'SET_IS_AUTHENTICATED', payload: true})

			props.dispatch({type: 'SET_IS_REGISTERED', payload: res.data?.isRegistered})
			dispatch({type: 'SET_IS_REGISTERED', payload: res.data?.isRegistered})
			
			props.dispatch({type: 'SET_IS_TWO_FACTOR_AUTHENTICATION_ENABLED', payload: res.data?.isTwoFactorAuthenticationEnabled})
			dispatch({type: 'SET_IS_TWO_FACTOR_AUTHENTICATION_ENABLED', payload: res.data?.isTwoFactorAuthenticationEnabled})

			props.dispatch({type: 'SET_IS_TWO_FACTOR_AUTHENTICATED', payload: res.data?.isTwoFactorAuthenticated})
			dispatch({type: 'SET_IS_TWO_FACTOR_AUTHENTICATED', payload: res.data?.isTwoFactorAuthenticated})

			return 200
		} catch (err) {
			props.dispatch({type: 'SET_IS_AUTHENTICATED', payload: false})
			dispatch({type: 'SET_IS_AUTHENTICATED', payload: false})

			props.dispatch({type: 'SET_IS_TWO_FACTOR_AUTHENTICATED', payload: false})
			dispatch({type: 'SET_IS_TWO_FACTOR_AUTHENTICATED', payload: false})
			return 500
		}
	}

	const logout = () => {
		try {
			AuthService.logout()
			props.dispatch({type:'SET_IS_AUTHENTICATED', payload:false})
			dispatch({type:'SET_IS_AUTHENTICATED', payload:false})

			props.dispatch({type:'SET_IS_TWO_FACTOR_AUTHENTICATED', payload:false})
			dispatch({type:'SET_IS_TWO_FACTOR_AUTHENTICATED', payload:false})
		} catch(err) {
		}
	}

	const onSubmit2fa = async (data:any) => {
		try {
			await AuthService.twoFactorAuthenticationLogin(data.twoFactorAuthenticationCode)

			props.dispatch({type:'SET_IS_TWO_FACTOR_AUTHENTICATED', payload:true})
			dispatch({type:'SET_IS_TWO_FACTOR_AUTHENTICATED', payload:true})
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

			props.dispatch({type:'SET_IS_REGISTERED', payload:true})
			dispatch({type:'SET_IS_REGISTERED', payload:true})
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
        if (status === 200) {
			props.dispatch({type:'SET_IS_AUTHENTICATED', payload:true})
			dispatch({type:'SET_IS_AUTHENTICATED', payload:true})
		} else {
			props.dispatch({type:'SET_IS_AUTHENTICATED', payload:false})
			dispatch({type:'SET_IS_AUTHENTICATED', payload:false})
		}
    };
    asyncWrapper();
    }, [state.isAuthenticated, state.isRegistered, state.isTwoFactorAuthenticated])

	return (<>
		{state.isAuthenticated && (!state.isTwoFactorAuthenticated && state.isTwoFactorAuthenticationEnabled) && <TwoFactorAuthenticationComponent />}
		{ state.isAuthenticated && !state.isRegistered && <RegisterComponent/>}
		{state.isAuthenticated && !state.isRegistered && <LogoutComponent/>}
		{!state.isAuthenticated && <LoginComponent />}
	</>)
}

export default Auth