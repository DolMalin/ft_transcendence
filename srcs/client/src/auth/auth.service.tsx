import axios from "axios"

class AuthService {
	api = axios.create({withCredentials:true})

	async login() {
		const param:any = new URLSearchParams(window.location.search)
		if (!param.has("code"))
			return 403
		
		try {
			const res:any = await this.api.get(`http://127.0.0.1:4545/auth/login/${param.get("code")}`)
			localStorage.setItem("accessToken", res.data.accessToken)
			return res.status	
		} catch (err:any) {
			return err.response.status
		}
	}

	async logout() {
		try {
			const res:any = await this.api.get(`http://127.0.0.1:4545/auth/logout`)
			localStorage.removeItem("accessToken")
			return res.status
		} catch(err:any) {
			return err.response.status
		}
	}

	async refresh() {
		try {
			const res:any = await this.api.get(`http://127.0.0.1:4545/auth/refresh`)
			localStorage.setItem("accessToken", res.data.accessToken)
			return res.status
		} catch(err:any) {
			return err.response?.status
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
			const res: any  = await this.api.get(`http://127.0.0.1:4545/auth/validate`, {headers: this.getAuthHeader()})
			return res.status
		} catch(err:any) {
			return err.response.status
		}
	}

}

export default new AuthService()