import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { UpdateAuthDto } from '../dto/update-auth.dto';
import axios from 'axios'

@Injectable()
export class AuthService {

  
  buildRedirectUrl(): string {
    let url = new URL( '/oauth/authorize', process.env.OAUTH_URL)
    url.searchParams.set('client_id', process.env.CLIENT_ID)
    url.searchParams.set('redirect_uri', process.env.REDIRECT_URL)
    url.searchParams.set('response_type', 'code')
    return (url.toString())
  }

  async get42Token(code: string): Promise<string> {
    return new Promise((resolve, reject) => {
        axios.post(
          "https://api.intra.42.fr/oauth/token",
          {
            grant_type: 'authorization_code',
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.SECRET,
            code: code,
            redirect_uri: process.env.REDIRECT_URL
          },
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        ).then((response) => {
          resolve(response.data as string)
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
