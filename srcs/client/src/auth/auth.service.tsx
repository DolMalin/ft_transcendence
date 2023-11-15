import axios from "axios"
import Cookies from 'universal-cookie';

class AuthService {
	api = axios.create({withCredentials:true})
	
	async logout() {
		const cookies = new Cookies()

		try {
			const res:any = await this.api.get(`http://127.0.0.1:4545/auth/logout`)
			cookies.remove("accessToken")
			cookies.remove("refreshToken")
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
		const accessToken = new Cookies().get("accessToken")
		return accessToken
	}

	getAuthHeader() {
		const accessToken = this.getAccessToken()
		return { Authorization: 'Bearer ' + accessToken}
	}

	async validate() {
		try {
			const res: any  = await this.api.get(`http://127.0.0.1:4545/auth/validate`, {headers: this.getAuthHeader()})
			return res
		} catch(err:any) {
			return err.response?.status
		}
	}

	async register(username: string, avatar:string) {
		try {
			const res: any  = await this.api.post(`http://127.0.0.1:4545/auth/register`, {username: username, avatar: avatar}, {headers: this.getAuthHeader()})
			console.log("BONJOUUUUR")
			return res
		} catch(err:any) {
			console.log(err)
			return err
		}	
	}

}

export default new AuthService()