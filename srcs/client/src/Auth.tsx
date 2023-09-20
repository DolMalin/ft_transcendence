import axios from 'axios'
import React, { Component, useEffect, useState} from 'react'
import AuthService from './auth.service'
import { Navigate } from "react-router-dom"

class Auth extends Component {
	
	state = {
			url: "",
			redirect: null
	}

	setStateAsync(state: any) {
		return new Promise((resolve: any) => {
			this.setState(state, resolve)
		})
	}

	async fetchRedirectUri() {
		try {
			const res = await axios.get("http://127.0.0.1:4545/auth/redirect")
			this.setStateAsync({url: res.data.url})
		} catch (err) {
			console.log(err)
		}
	}

	
	async componentDidMount() {
		await this.fetchRedirectUri()
		await AuthService.login()

		const isLogged = await AuthService.validate()
		if (isLogged)
			this.setState({redirect:'/profile'})
					
	}
	
	render() {
		if (this.state.redirect) {
			return <Navigate to={this.state.redirect}/>
		}
		
		return (
			<div className="Log">
				<a href=
					{this.state.url}
				>
					Log in with 42
				</a>

			</div>
		)
	
	}
}

export default Auth