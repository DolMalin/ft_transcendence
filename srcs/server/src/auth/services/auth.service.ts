import { Injectable, Logger, UnauthorizedException} from '@nestjs/common';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { UpdateAuthDto } from '../dto/update-auth.dto';
import { UsersService } from 'src/users/services/users.service';
import { User } from 'src/users/entities/user.entity';
import { Request } from 'express';

import axios from 'axios'
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
    ) { }

  
  /**
   * 
   * @description Build the url that redirects to the 42 auth app
   */
  buildRedirectUrl(): string {
    let url = new URL( '/oauth/authorize', process.env.OAUTH_URL)
    url.searchParams.set('client_id', process.env.CLIENT_ID)
    url.searchParams.set('redirect_uri', process.env.CALLBACK_URL)
    url.searchParams.set('response_type', 'code')
    return (url.toString())
  }


  /**
   * 
   * @description Send a post request to the 42 api with the `callback code` and fetch the 42 auth `token` 
   */
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
        ).then((res) => {
          resolve(res.data.access_token as string)
        }, (err) => {
          resolve(null)
        })

    })
  }


  /**
   * 
   * @description  Send a get request to the 42 api with the `42 token` and fetch the token owner `ftId`
   */
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
      ).then((res) => {
        resolve(res.data.id as number)
      }, (err) => {
        resolve(null)
      })
    })
  }


  /**
   * @description Check the validity of a user from his given `ftId`, and then return him if it exists, or creates a new one
   */
  async validateUser(ftId: number): Promise<User> {
    const user = await this.usersService.findOneByFtId(ftId)
    if (user) {
      Logger.log(`User #${ftId} logged`)
      return user
    }
    const newUser = await this.usersService.create({ftId: ftId})
    Logger.log(`User ${ftId} created`)
    return newUser
  }


  /**
   * 
   * @description Creates a `jwt` from the given `payload`
   */
  async createJwt(payload: {sub: Number}): Promise<string> {
    return await this.jwtService.signAsync(payload)
  }

  /**
   * 
   * @description Check the validity of a given `jwt`, and returns its `payload`
   */
  async validateJwt(token: string): Promise<any> {
      const payload = await this.jwtService.verifyAsync(token, {secret: process.env.JWT_SECRET})
      return payload
  }

  /**
   * 
   * @description extract the token from the request header, or send undefined
   */
  extractTokenFromHeader(req: Request): string | undefined {
		const [type, token] = req.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
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
