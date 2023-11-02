import axios from 'axios'
import React, { Component, useEffect, useState} from 'react'
import AuthService from './auth.service'
import { Navigate } from "react-router-dom"


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

	const validate = async () => {
		if (AuthService.getAccessToken()?.length === 0) {
			setIsAuthenticated(false)
			return 401
		}
		
		let status = await AuthService.validate()
		if (status === 200)
			setIsAuthenticated(true)
		else if (status === 401 && AuthService.getAccessToken()){
			status = await AuthService.refresh()
			if (status === 200)
				setIsAuthenticated(true)
			else
				setIsAuthenticated(false)
		}
		else
			setIsAuthenticated(false)	
		return status
	}

	const login = async () => {
		await AuthService.login()
		await validate()
	}

	const logout = () => {
		AuthService.logout()
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
				<button onClick={logout}>Logout</button>
			</div>
		)
	}

	useEffect(() => {
		login()
		fetchAuthUrl()
	}, [])


		
	return (<>
		{isAuthenticated && <LogoutComponent />}
		{!isAuthenticated && <LoginComponent />}
	</>)
}

export default Auth