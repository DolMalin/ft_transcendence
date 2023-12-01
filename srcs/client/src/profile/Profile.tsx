import axios from 'axios'
import React, { Component, useEffect, useState, useReducer} from 'react'
import { Navigate } from "react-router-dom"
import { Button, Link, Input, FormControl, Flex, Box, Image} from '@chakra-ui/react'
import { useForm } from "react-hook-form";
import AuthService from '../auth/auth.service';
import { stateType} from '../auth/components/reducer';
import reducer from '../auth/components/reducer';
import Auth from '../auth/Auth';


function Profile(props : {state: stateType, dispatch: Function}) {
	const [qrCode, setQrCode] = useState('')
	const [displayActivate2FA, setDisplayActivate2FA] = useState(false)
	const [displayDeactivate2FA, setDisplayDeactivate2FA] = useState(false)

	const [state, dispatch] = useReducer(reducer, {
		isAuthenticated: props.state.isAuthenticated,
		isRegistered: props.state.isRegistered,
		isTwoFactorAuthenticated: props.state.isTwoFactorAuthenticated,
		isTwoFactorAuthenticationEnabled: props.state.isTwoFactorAuthenticationEnabled
	  })

	const validate = async () => {
		try {
			const res = await AuthService.validate()
			props.dispatch({type: 'SET_IS_AUTHENTICATED', payload: true})
			dispatch({type:'SET_IS_AUTHENTICATED', payload: true})

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

	const logout = async () => {
		try {
			props.dispatch({type:'SET_IS_AUTHENTICATED', payload:false})
			dispatch({type:'SET_IS_AUTHENTICATED', payload:false})
			
			props.dispatch({type:'SET_IS_TWO_FACTOR_AUTHENTICATED', payload:false})
			dispatch({type:'SET_IS_TWO_FACTOR_AUTHENTICATED', payload:false})
			await AuthService.logout(state.isTwoFactorAuthenticated)
			window.location.reload()
		} catch(err) {
		}
	}

	const onActivate2fa = async (data:any) => {

		try {
			await AuthService.twoFactorAuthenticationTurnOn({twoFactorAuthenticationCode:data.twoFactorAuthenticationCode})

			props.dispatch({type:'SET_IS_TWO_FACTOR_AUTHENTICATED', payload:true})
			dispatch({type:'SET_IS_TWO_FACTOR_AUTHENTICATED', payload:true})

			props.dispatch({type:'SET_IS_TWO_FACTOR_AUTHENTICATION_ENABLED', payload:true})
			dispatch({type:'SET_IS_TWO_FACTOR_AUTHENTICATION_ENABLED', payload:true})

			setDisplayActivate2FA(false)
		} catch(err) {
			console.log(err)
		}
	}

	const onDeactivate2fa = async (data:any) => {

		try {
			await AuthService.twoFactorAuthenticationTurnOff({twoFactorAuthenticationCode:data.twoFactorAuthenticationCode})

			props.dispatch({type:'SET_IS_TWO_FACTOR_AUTHENTICATION_ENABLED', payload:false})
			dispatch({type:'SET_IS_TWO_FACTOR_AUTHENTICATION_ENABLED', payload:false})

			setDisplayDeactivate2FA(false)
		} catch(err) {
			console.log(err)
		}
	}


	function LogoutComponent() {
		return (
			<div className="Log">
				<Button fontWeight={'normal'} onClick={logout}>Logout</Button>
			</div>
		)
	}

	async function activateTwoFactorAuthentication() {
		const res = await AuthService.get('http://127.0.0.1:4545/auth/2fa/generate')
		if (res.status === 200) {
				setQrCode(res.data)
				setDisplayActivate2FA(true)
			}
	}

	async function deactivateTwoFactorAuthentication() {
			setDisplayDeactivate2FA(true)
	}

	function ActivateTwoFactorAuthentication() {
		
		return(<>
			<Image src={qrCode}></Image>
			<ActivateTwoFactorAuthenticationForm/>
		</>)
	}

	function DeactivateTwoFactorAuthentication() {
		
		return(<>
			<DeactivateTwoFactorAuthenticationForm/>
		</>)
	}



	function TwoFactorAuthenticationButton() {
		if (!props.state.isTwoFactorAuthenticationEnabled) {
			return (
				<div>
					<Button onClick={activateTwoFactorAuthentication} fontWeight={'normal'} >Activer 2FA</Button>
				</div>
			)
		} else {
			return (
				<div>
					<Button onClick={deactivateTwoFactorAuthentication}fontWeight={'normal'} >Désactiver 2FA</Button>
				</div>
			)
		}
	}

	function ActivateTwoFactorAuthenticationForm() {
		const { register, handleSubmit, formState: { errors } } = useForm();
		<Image src={qrCode}></Image>

		return (
			<Flex width="half" align="center" justifyContent="center">
				<Box p={2}>
					<form onSubmit={handleSubmit(onActivate2fa)}>
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

	function DeactivateTwoFactorAuthenticationForm() {
		const { register, handleSubmit, formState: { errors } } = useForm();

		return (
			<Flex width="half" align="center" justifyContent="center">
				<Box p={2}>
					<form onSubmit={handleSubmit(onDeactivate2fa)}>
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


	useEffect(() => {async function  asyncWrapper() {validate()}; asyncWrapper()}, [state.isAuthenticated, state.isRegistered, state.isTwoFactorAuthenticated, state.isTwoFactorAuthenticationEnabled, props.state.isAuthenticated])

	return (<>
		{<TwoFactorAuthenticationButton />}
		{displayActivate2FA && <ActivateTwoFactorAuthentication/>}
		{displayDeactivate2FA && <DeactivateTwoFactorAuthentication/>}
		{<LogoutComponent />}
	</>)
}

export default Profile