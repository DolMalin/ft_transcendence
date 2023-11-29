import axios from 'axios'
import React, { Component, useEffect, useState} from 'react'
import { Navigate } from "react-router-dom"
import { Button, Link, Input, FormControl, Flex, Box, Image} from '@chakra-ui/react'
import { useForm } from "react-hook-form";
import AuthService from '../auth/auth.service';


function Profile(props : {
	isAuthenticated : boolean,
	setIsAuthenticated: Function,
	isRegistered : boolean,
	setIsRegistered: Function,
	isTwoFactorAuthenticated: boolean,
	setIsTwoFactorAuthenticated: Function,
	isTwoFactorAuthenticationEnabled:boolean,
	setIsTwoFactorAuthenticationEnabled:Function
}) {
	const [authUrl, setAuthUrl] = useState('')
	const [isAuthenticated, setIsAuthenticated] = useState(props.isAuthenticated)
	const [isRegistered, setIsRegistered] = useState(props.isRegistered)
	const [isTwoFactorAuthenticated, setIsTwoFactorAuthenticated] = useState(props.isTwoFactorAuthenticated)
	const [isTwoFactorAuthenticationEnabled, setIsTwoFactorAuthenticationEnabled] = useState(props.isTwoFactorAuthenticationEnabled)
	const [qrCode, setQrCode] = useState('')
	const [displayActivate2FA, setDisplayActivate2FA] = useState(false)
	const [displayDeactivate2FA, setDisplayDeactivate2FA] = useState(false)


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

	const onActivate2fa = async (data:any) => {

		try {
			await AuthService.twoFactorAuthenticationTurnOn({twoFactorAuthenticationCode:data.twoFactorAuthenticationCode})

			props.setIsTwoFactorAuthenticated(true)
			setIsTwoFactorAuthenticated(true)

			setIsTwoFactorAuthenticationEnabled(true)
			props.setIsTwoFactorAuthenticationEnabled(true)

			setDisplayActivate2FA(false)
		} catch(err) {
			console.log(err)
		}
	}

	const onDeactivate2fa = async (data:any) => {

		try {
			await AuthService.twoFactorAuthenticationTurnOff({twoFactorAuthenticationCode:data.twoFactorAuthenticationCode})

			props.setIsTwoFactorAuthenticationEnabled(false)
			setIsTwoFactorAuthenticationEnabled(false)

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
			setIsTwoFactorAuthenticated(false)
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
		console.log(isTwoFactorAuthenticationEnabled)
		if (!isTwoFactorAuthenticationEnabled) {
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


	useEffect(() => {}, [isAuthenticated, isRegistered, isTwoFactorAuthenticated, isTwoFactorAuthenticationEnabled])

	return (<>
		{<TwoFactorAuthenticationButton />}
		{displayActivate2FA && <ActivateTwoFactorAuthentication/>}
		{displayDeactivate2FA && <DeactivateTwoFactorAuthentication/>}
		{<LogoutComponent />}
	</>)
}

export default Profile