import React, { Component } from 'react'
import axios from 'axios'

const url = "http://127.0.0.1:4545/auth/redirect"

class Log extends Component {
	state = {
		jsonData: {url}
	}

	setStateAsync(state: any) {
		return new Promise((resolve: any) => {
			this.setState(state, resolve)
		})
	}

	async jsonHandler() {
		try {
			const res = await axios.get(url)
			this.setStateAsync({jsonData: res.data})
			// console.log(this.state.jsonData.url)
		} catch (err) {
			console.log(err)
		}
	}

	async componentDidMount() {
		await this.jsonHandler()
	}

	render() {
		// let link = this.state.jsonData.url;
		// console.log(this.state.jsonData.url)
		return (
			<div className="Log">
				<a href=
					{this.state.jsonData.url}
				>
					Log
				</a>
			</div>
			
		)
	}
}

export default Log