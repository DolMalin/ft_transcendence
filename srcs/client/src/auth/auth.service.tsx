import axios from "axios"

class AuthService {

	async login() {
		const param:any = new URLSearchParams(window.location.search)
		if (!param.has("code"))
			return false
		
		try {
			const res:any = await axios.get(`http://127.0.0.1:4545/auth/login/${param.get("code")}`, {withCredentials:true})
			localStorage.setItem("accessToken", res.data.accessToken)	
		} catch (err) {
			console.log("failed to auth")
		}
	}

	async logout() {
		try {
			const res:any = await axios.get(`http://127.0.0.1:4545/auth/logout`, {withCredentials:true})
		} catch(err) {

		}
	}

	getAccessToken() {
		return localStorage.getItem("accessToken")
	}

	getAuthHeader() {
		const accessToken = this.getAccessToken()
		return { Authorization: 'Bearer ' + accessToken}
	}

	async validate() {
		try {
			const res: any  = await axios.get(`http://127.0.0.1:4545/auth/validate`, {headers: this.getAuthHeader()})
			return true
		} catch(err) {
			console.log("NO")
			return false
		}
	}

}

export default new AuthService()