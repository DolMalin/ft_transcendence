import React, { Component, useEffect, useState, useReducer} from 'react'
import { Button, Flex, Divider} from '@chakra-ui/react'
import { useForm } from "react-hook-form";
import AuthService from '../auth/auth.service';
import { stateType} from '../auth/components/reducer';
import reducer from '../auth/components/reducer';
import { Socket } from 'socket.io-client';
import * as Constants from '../game/globals/const';
import ProfileInfo from './ProfileInfo';
import TwoFASettings from './TwoFASettings';
import UsernameChange from './UsernameChange';
import AvatarChange from './AvatarChange';


function Profile(props : {state: stateType, dispatch: Function, gameSock : Socket, chatSocket : Socket}) {

	type FlexDirection = "column" | "inherit" | "-moz-initial" | "initial" | "revert" | "unset" | "column-reverse" | "row" | "row-reverse" | undefined;
    
    const [flexDisplay, setFlexDisplay] = useState<FlexDirection>(window.innerWidth <= 1130 ? 'column' : 'column');
	const [boxWidth, setBoxWidth] = useState(window.innerWidth <  592.59 ? '320px' : '54%');
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

			console.error(`${err.response?.data?.message} (${err.response?.data?.error})`)
			return err.response?.status
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
			console.error(`${err.response?.data?.message} (${err.response?.data?.error})`)
		}
	}


	function LogoutComponent() {
		return (
			<>
				<Button onClick={logout}
				fontWeight={'normal'}
				borderRadius={'0px'}
				bg={'none'}
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

	useEffect(() => {
        
        function debounce(func : Function, ms : number) {
            let timer : string | number | NodeJS.Timeout;
        
            return ( function(...args : any) {
                clearTimeout(timer);
                timer = setTimeout( () => {
                    timer = null;
                    func.apply(this, args)
                }, ms);
            });
        };

        const debouncedHandleResize = debounce(function handleResize() {
            if (window.innerWidth <  592.59)
			{
				setBoxWidth('320px');
			}
			else
			{
				setBoxWidth('54%');
			}
        }, Constants.DEBOUNCE_TIME);
        window.addEventListener('resize', debouncedHandleResize)

        return (() => {
            window.removeEventListener('resize', debouncedHandleResize);
        })
    },  []);
	return (<>
			<Flex 
			width={'100%'}
			height={Constants.BODY_HEIGHT}
			background={Constants.BG_COLOR}
			scrollBehavior={'smooth'}
			alignItems={'center'}
			justifyContent={'center'}
			flexDir={'row'}
			wrap={'wrap'}
			overflow={'auto'}
			textColor={'white'}
			>
				<Flex pos={'fixed'} bottom={'0'} right={'0'}>
				{<LogoutComponent />}
				</Flex>

				<Flex minW={'320px'}
				w={'20%'}
				h={'80%'}
				minH={'1059px'}
				bg={Constants.BG_COLOR_FADED}
				padding={'10px'}
				wrap={'nowrap'}
				justifyContent={'space-evenly'}
				flexDir={'column'}
				>
						<TwoFASettings state={props.state} dispatch={props.dispatch}/>
						
						<Divider/>
						<UsernameChange/>
						
						<Divider/>
						<AvatarChange/>
				</Flex>

				<Flex minW={'320px'}
				minH={'1059px'}
				height={'80%'}
				margin={'3%'}
				width={boxWidth}
				bg={Constants.BG_COLOR_FADED}
				padding={'10px'}
				wrap={'wrap'}
				flexDir={'column'}
				>
					<ProfileInfo gameSock={props.gameSock} chatSock={props.chatSocket}/>
				</Flex>
		</Flex>
	</>)
}

export default Profile