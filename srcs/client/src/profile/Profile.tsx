import React, {useEffect, useState, useReducer} from 'react'
import { Button, Input, FormControl, Flex, Box, Image, Heading, Text, Divider, Avatar} from '@chakra-ui/react'
import { useForm } from "react-hook-form";
import AuthService from '../auth/auth.service';
import { stateType} from '../auth/components/reducer';
import reducer from '../auth/components/reducer';
import { Socket } from 'socket.io-client';
import * as Constants from '../game/globals/const';
import ProfileInfo from './ProfileInfo';
import TwoFASettings from './TwoFASettings';
import UsernameChange from './UsernameChange';


function Profile(props : {state: stateType, dispatch: Function, gameSock : Socket}) {
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
			await AuthService.logout(state.isTwoFactorAuthenticated, props.gameSock)
			window.location.reload()
		} catch(err) {
		}
	}

	function LogoutComponent() {
		return (
			<>
				<Button onClick={logout}
				fontWeight={'normal'}
				borderRadius={'0px'}
				bg={Constants.BG_COLOR}
				textColor={'white'}
				_hover={{background : 'white', textColor : Constants.BG_COLOR}}
				>Logout</Button>
			</>
		)
	}

	useEffect(() => {
		async function  asyncWrapper() {validate()};
		asyncWrapper()
	}, [state.isAuthenticated, state.isRegistered, state.isTwoFactorAuthenticated, state.isTwoFactorAuthenticationEnabled, props.state.isAuthenticated])

	return (<>
			<Box 
			width={'100vw'}
			height={Constants.BODY_HEIGHT}
			background={Constants.BG_COLOR}
			padding={'30px'}
			scrollBehavior={'smooth'}
			display={'flex'}
			alignItems={'center'}
			justifyContent={'center'}
			flexDir={'row'}
			flexWrap={'wrap'}
			overflow={'auto'}
			textColor={'white'}
			>

				<Flex minW={'360px'}
				minH={'562px'}
				h={'80%'}
				bg={Constants.BG_COLOR_FADED}
				padding={'10px'}
				wrap={'wrap'}
				flexDir={'column'}>
					<Flex h={'100%'} w={'100%'}
					wrap={'wrap'}
					flexDir={'column'}
					justifyContent={'space-evenly'}
					>
						<Flex minH={'180px'}
						alignItems={'center'}
						justifyContent={'center'}
						padding={'10px'}
						flexDir={'column'}>
							<TwoFASettings state={props.state} dispatch={props.dispatch}/>
						</Flex>

						<Divider></Divider>

						<Flex minH={'180px'}
						alignItems={'center'}
						justifyContent={'center'}
						flexDir={'column'}
						padding={'10px'}>
							<UsernameChange/>
						</Flex>

						<Divider></Divider>

						<Flex minH={'180px'}
						alignItems={'center'}
						justifyContent={'center'}
						padding={'10px'}>
							<Button
							fontWeight={'normal'}
							borderRadius={'0px'}
							bg={Constants.BG_COLOR_FADED}
							textColor={'white'}
							_hover={{background : 'white', textColor : Constants.BG_COLOR}}
							> 
							Change Avatar 
							</Button>
						</Flex>
					</Flex>


				</Flex>
				<Flex minW={'360px'}
				minH={'562px'}
				height={'80%'}
				width={'40vw'}
				bg={Constants.BG_COLOR_FADED}
				margin={'60px'}
				padding={'10px'}
				wrap={'wrap'}
				flexDir={'column'}
				>
					<ProfileInfo/>
				</Flex>
				<Flex w={'100%'}>
					{<LogoutComponent />}
				</Flex>
		</Box>
	</>)
}

export default Profile