import axios from 'axios'
import React, { Component, useEffect, useState} from 'react'
import AuthService from './auth.service'
import { Navigate } from "react-router-dom"


// function Auth() {
// 	const [authUrl, setAuthUrl] = useState('')
// 	const [isAuthenticated, setIsAuthenticated] = useState(false)
// 	const [redirect, setRedirect] = useState('')

// 	const fetchAuthUrl = async () => {
// 		try {
// 			const res = await axios.get("http://127.0.0.1:4545/auth/redirect")
// 			setAuthUrl(res.data.url)
// 		} catch (err) {
// 			console.error(err)
// 		}
// 	}

// 	const Login = async () => {
// 		if (isAuthenticated)
// 			return

// 		await fetchAuthUrl()
// 		await AuthService.login()

// 		const isLogged = await AuthService.validate()
// 		if (isLogged) {
// 			setRedirect('/profile')
// 			setIsAuthenticated(true)
// 		}
// 		else
// 			setRedirect('/')
		
// 	}

// 	useEffect(() => {
// 		Login()
// 	}, [])

// 	if (isAuthenticated) {
// 		return <Navigate to={redirect}/>
// 	}
		
// 	return (
// 		<div className="Log">
// 			<a href=
// 				{authUrl}
// 			>
// 				Log in with 42
// 			</a>

// 		</div>
// 	)
// }

// const loginComponent = (authUrl: string) => {
// 	<div className="Log">
// 		<a href=
// 			{authUrl}
// 		>
// 			Log in with 42
// 		</a>
// 	</div>
// }


function Auth() {
	const [authUrl, setAuthUrl] = useState('')
	const [isAuthenticated, setIsAuthenticated] = useState(false)

	const fetchAuthUrl = async () => {
		try {
			const res = await axios.get("http://127.0.0.1:4545/auth/redirect")
			setAuthUrl(res.data.url)
		} catch (err) {
			console.error(err)
		}
	}

	const login = async () => {

		await AuthService.login()
		const isLogged = await AuthService.validate()
		if (isLogged)
			setIsAuthenticated(true)
		else
			setIsAuthenticated(false)
	}

	function LoginComponent() {
		return (
			<div className="Log">
				<a href=
					{authUrl}
				>
					Log in with 42
				</a>
			</div>
		)
	}

	function LogoutComponent() {
		return (
			<div className="Log">
				<button onClick={AuthService.logout}>Logout</button>
			</div>
		)
	}

	useEffect(() => {
		if (isAuthenticated){
			console.log("COUCOU")
			return
		}
		login()
		fetchAuthUrl()
	}, [])


		
	return (<>
		{isAuthenticated && <LogoutComponent />}
		{!isAuthenticated && <LoginComponent />}
	</>)
}

export default Auth