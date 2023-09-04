import React, { Component, useEffect, useState} from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'

class Log extends Component {
	
	state = {
		jsonData: {
			url: "",
		},
		isLogged:false
	}

	setStateAsync(state: any) {
		return new Promise((resolve: any) => {
			this.setState(state, resolve)
		})
	}

	async fetchRedirectUri() {
		try {
			const res = await axios.get("http://127.0.0.1:4545/auth/redirect")
			this.setStateAsync({jsonData: res.data})
		} catch (err) {
			console.log(err)
		}
	}

	async login() {
		const param:any = new URLSearchParams(window.location.search)
		if (!param.has("code"))
			return false
		
		try {
			const jwt:any = await axios.get(`http://127.0.0.1:4545/auth/login/${param.get("code")}`)
			Cookies.set('token', jwt.data, {expires:7})
			console.log(jwt.data)
			this.setStateAsync({isLogged:true})
			
		} catch (err) {
			console.log("fail to auth")
		}
	}

	
	async componentDidMount() {
		await this.fetchRedirectUri()
		await this.login()
	}
	
	render() {
		
		if (this.state.isLogged === false) {
			return (
				<div className="Log">
					<a href=
						{this.state.jsonData.url}
					>
						Log in with 42
					</a>

				</div>
			)
		} else {
			return (
				<div>
					Bienvenue FDEP
				</div>
			)
		}
	}
}

// function Log() {
// 	const [url, setUrl] = useState("");

// 	useEffect( ()=>{
// 		async function getUrl () {
// 			const res = await axios.get("http://127.0.0.1:4545/auth/redirect")
// 			setUrl(res.data.url)
// 		}

// 		async function login() {
// 			const param:any = new URLSearchParams(window.location.search)
// 			if (!param.has("code"))
// 				return
// 			const jwt:any = await axios.get(`http://127.0.0.1:4545/auth/login/${param.get("code")}`)
// 			Cookies.set('token', jwt.data, {expires:7})
// 		}

// 		console.log("JAIME LE PIPI")
// 		getUrl()
// 		login()
// 	}, [])


// 	return (
// 			<div className="Log">

// 				<a href=
// 					{url}
// 				>
// 					Log in with 42
// 				</a>

// 			</div>
// 	)
// }

export default Log