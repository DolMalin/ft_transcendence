import axios from 'axios'
import React, { Component, useEffect, useState} from 'react'
import AuthService from './auth/auth.service'
import { Navigate } from "react-router-dom"

class Profile extends Component {
	
	state = {
			redirect: null
	}

	setStateAsync(state: any) {
		return new Promise((resolve: any) => {
			this.setState(state, resolve)
		})
	}

	async componentDidMount() {

		const isLogged = await AuthService.validate()
		if (!isLogged)
			this.setState({redirect:'/'})
			
	}
	
	render() {
		if (this.state.redirect) {
			return <Navigate to={this.state.redirect}/>
		}
		return (
			<div className="Log">
				Hello !
			</div>
		)
	
	}
}

export default Profile