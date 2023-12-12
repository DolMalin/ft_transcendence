import React, {useEffect, useState, useReducer} from 'react'
import { Button, Input, FormControl, Flex, Box, Image, Heading, Text, Divider, Avatar} from '@chakra-ui/react'
import { useForm } from "react-hook-form";
import AuthService from '../auth/auth.service';
import { stateType} from '../auth/components/reducer';
import reducer from '../auth/components/reducer';
import * as Constants from '../game/globals/const';

function TwoFASettings (props : {state: stateType, dispatch: Function}) {

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

	async function activateTwoFactorAuthentication() {
		if (displayActivate2FA === false) {
			try {

				const res = await AuthService.get(process.env.REACT_APP_SERVER_URL + '/auth/2fa/generate')
				if (res.status === 200) {
					setQrCode(res.data)
					setDisplayActivate2FA(true)
				}
			}
			catch(err) {
				console.error(`${err.response.data.message} (${err.response.data.error})`)
			}
		}
		else
			setDisplayActivate2FA(false);
	}

	async function deactivateTwoFactorAuthentication() {
			setDisplayDeactivate2FA(true)
	}

	function ActivateTwoFactorAuthentication() {
		
		return(<>
			<ActivateTwoFactorAuthenticationForm/>
		</>)
	}

	function DeactivateTwoFactorAuthentication() {
		
		return(<>
			<DeactivateTwoFactorAuthenticationForm/>
		</>)
	}



	function TwoFactorAuthenticationButton() {

		const text = displayActivate2FA ? "maybe not" : "Activate 2FA"
		if (!props.state.isTwoFactorAuthenticationEnabled) {
			return (
				<>
					<Button onClick={activateTwoFactorAuthentication}
					fontWeight={'normal'}
					borderRadius={'0px'}
					marginBottom={'10px'}
					bg={'none'}
					textColor={'white'}
					_hover={{background : 'white', textColor : Constants.BG_COLOR}}
					>
					{text}
					</Button>
				</>
			)
		} else {
			return (
				<>
					<Button onClick={deactivateTwoFactorAuthentication}
					fontWeight={'normal'}
					borderRadius={'0px'}
					bg={'none'}
					textColor={'white'}
					_hover={{background : 'white', textColor : Constants.BG_COLOR}}
					>
						Disable 2FA
					</Button>
				</>
			)
		}
	}

	function ActivateTwoFactorAuthenticationForm() {
		const { register, handleSubmit, formState: { errors } } = useForm();
		
		return (
			<>
				<Image src={qrCode}
				boxSize={'180px'}
				marginBottom={'10px'}
				></Image>
					<form onSubmit={handleSubmit(onActivate2fa)} style={{display: 'flex', flexDirection : 'column', justifyContent : 'center', alignItems: 'center'}}>
						<FormControl isRequired>
							<Input
								type="text"
								placeholder="2fa code"
								textAlign={'center'}
								marginBottom={'10px'}
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
						w={'150px'}
						borderRadius={'0px'}
						textAlign={'center'}
						bg={'none'}
						textColor={'white'}
						_hover={{background : 'white', textColor : Constants.BG_COLOR}}
						type='submit'
						>
							Submit
						</Button>
					</form>
			</>
		)
	}

	function DeactivateTwoFactorAuthenticationForm() {
		const { register, handleSubmit, formState: { errors } } = useForm();

		return (
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
				borderRadius={'0px'}
				w={'150px'}
				bg={'none'}
				textColor={'white'}
				_hover={{background : 'white', textColor : Constants.BG_COLOR}}
				type='submit'
				>
					Disable 2FA
				</Button>
			</form>
		)
	}

	useEffect(() => {
		async function  asyncWrapper() {validate()};
		asyncWrapper()
	}, [state.isAuthenticated, state.isRegistered, state.isTwoFactorAuthenticated, state.isTwoFactorAuthenticationEnabled, props.state.isAuthenticated])

    return (<>
		<Flex minH={'353px'}
		alignItems={'center'}
		justifyContent={'center'}
		padding={'10px'}
		flexDir={'column'}>
			{<TwoFactorAuthenticationButton />}
			{displayActivate2FA && <ActivateTwoFactorAuthentication/>}
			{displayDeactivate2FA && <DeactivateTwoFactorAuthentication/>}
		</Flex>
    </>)
}

export default TwoFASettings