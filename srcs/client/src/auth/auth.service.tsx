import axios from "axios"
import Cookies from 'universal-cookie';



class AuthService {
	api = axios.create({withCredentials:true})

	async get(uri: string) {
		let retry: boolean = true
		try {
			const res: any = await this.api.get(uri,{ headers: {'Authorization': 'Bearer ' + this.getAccessToken()}})
			return res
	 	} catch(err) {
			if (err.response.status == 401 && retry) {
				retry = false
				try {
					await this.refresh()
					const res: any = await this.api.get(uri,{ headers: {Authorization: 'Bearer ' + this.getAccessToken()}})
					return res
				} catch (err) {
					return err.response
				}
			}
		}
	}

	async post(uri: string, params: any) {
		let retry: boolean = true
		try {
			const res: any = await this.api.post(`http://127.0.0.1:4545/auth/register`, params, {headers: {
				Authorization: 'Bearer ' + this.getAccessToken(),
				'Content-Type': 'multipart/form-data'
			}})
			console.log(res)
			return res
	 	} catch(err) {
			if (err.response.status == 401 && retry) {
				retry = false
				try {
					await this.refresh()
					const res: any = await this.api.post(`http://127.0.0.1:4545/auth/register`, params, {headers: {
						Authorization: 'Bearer ' + this.getAccessToken(),
						'Content-Type': 'multipart/form-data'
					}})
					return res
				} catch (err) {
					return err.response
				}
			}
		}
	}


	async logout() {
		const cookies = new Cookies()

		try {
			const res:any = await this.get(`http://127.0.0.1:4545/auth/logout`)
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
		return { 'Authorization': 'Bearer ' + accessToken}
	}

	async validate() {
		try {
			const res: any  = await this.get(`http://127.0.0.1:4545/auth/validate`)
			return res.status
		} catch(err) {
			return 401
		}
	}

	async register(data:any) {
		try {
			const res: any = await this.post(`http://127.0.0.1:4545/auth/register`, data)
		} catch(err) {

		}
	}

}

export default new AuthService()