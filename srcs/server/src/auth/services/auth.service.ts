import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { UpdateAuthDto } from '../dto/update-auth.dto';
import { UsersService } from 'src/users/services/users.service';
import axios from 'axios'

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) { }

  // async validateUser(username: string): Promise<any> {
  //   const user = await this.usersService.findOne()
  // }


  buildRedirectUrl(): string {
    let url = new URL( '/oauth/authorize', process.env.OAUTH_URL)
    url.searchParams.set('client_id', process.env.CLIENT_ID)
    url.searchParams.set('redirect_uri', process.env.CALLBACK_URL)
    url.searchParams.set('response_type', 'code')
    return (url.toString())
  }

  async getFtToken(code: string): Promise<string> {
    return new Promise((resolve, reject) => {

        const bodyParameters = {
          grant_type: 'authorization_code',
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.SECRET,
          code: code,
          redirect_uri: process.env.CALLBACK_URL
        }

        const config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }

        axios.post(
          "https://api.intra.42.fr/oauth/token",
          bodyParameters,
          config
        ).then((response) => {
          resolve(response.data.access_token as string)
        }, (err) => {
          reject(err)
        })

    })
  }

  async getFtId(token: string): Promise<number> {
    return new Promise((resolve, reject) => {

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }

      axios.get(
        "https://api.intra.42.fr/v2/me",
        config
      ).then((response) => {
        resolve(response.data.id as number)
      }, (err) => {
        reject(err)
      })

    })
  }

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth'
  }

  findAll() {
    return `This action returns all auth`
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`
  }

  remove(id: number) {
    return `This action removes a #${id} auth`
  }
}
