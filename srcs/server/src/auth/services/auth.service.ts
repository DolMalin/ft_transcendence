import { HttpException, HttpStatus, Injectable, Logger, Req, Res, UnauthorizedException, InternalServerErrorException, ForbiddenException} from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import { User } from 'src/users/entities/user.entity';

import axios from 'axios'
import * as argon2 from 'argon2'
import { JwtService } from '@nestjs/jwt'


// /me


// {
//   username
//   id
// }

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
    ) { }
  

  /**
   * @description Build the url that redirects to the 42 auth app
   */
  buildRedirectUrl(): object {
    let url = new URL( '/oauth/authorize', process.env.OAUTH_URL)
    url.searchParams.set('client_id', process.env.CLIENT_ID)
    url.searchParams.set('redirect_uri', process.env.CALLBACK_URL)
    url.searchParams.set('response_type', 'code')
    return ({url: url.toString()})
  }

  // /oauth/authorize/client_id/redirect/response_type=code

  // -> url vers page de 42
  // <+ 217.0.0.1/code=12398y1239821y3
  // -> oauth/token
  // <- token


  /**
   * @description Send a post request to the 42 api with the `callback code` and fetch the 42 auth `token` 
   */
  async getFtToken(code: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const bodyParameters = {
          grant_type: 'authorization_code',
          client_id: process.env.CLIENT_ID,
          code: code,
          client_secret: process.env.SECRET,
          redirect_uri: process.env.CLIENT_URL
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
      Logger.log(`User #${user.id} logged`)
      return user
    }
    const newUser = await this.usersService.create({ftId: ftId})
    Logger.log(`User ${newUser.id} created`)
    return newUser
  }


  async createAccessToken(payload: {id: string}): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn:'5min'
    })
  }


  async createRefreshToken(payload: {id: string}): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn:'7d'
    })
  }


  async updateRefreshToken(id: string, refreshToken: string) {
    await this.usersService.update(id, {
      refreshToken: await this.hash(refreshToken)
    })
  }


  async hash(data: string): Promise<string> {
    return argon2.hash(data)
  }


  /**
   * @description Check the validity of a given `jwt`, and returns its `payload`
   */
  async validateJwt(token: string): Promise<any> {
      const payload = await this.jwtService.verifyAsync(token, {secret: process.env.JWT_SECRET})
      return payload
  }


  /**
   * @description Login user by creating a jwt and store it in user's cookies
   */
  async login(req: any, res: any) {
    const refreshToken = await this.createRefreshToken({id: req.user.id})
    const accessToken = await this.createAccessToken({id: req.user.id})

    await this.updateRefreshToken(req.user.id, await this.hash(refreshToken))
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      domain:"127.0.0.1",
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, path: '/'})
      .send({accessToken: accessToken})

  }


  async refresh(req: any, res: any) {
    const user = await this.usersService.findOneById(req.user?.id)

    if (!user || !user.refreshToken)
      throw new ForbiddenException('access denied')

    if (! await argon2.verify(user.refreshToken, req.cookies?.refreshToken))
      throw new ForbiddenException('access denied')

    
    const refreshToken = await this.createRefreshToken({id: req.user.id})
    const accessToken = await this.createAccessToken({id: req.user.id})

    await this.updateRefreshToken(req.user.id, refreshToken)
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      domain:"127.0.0.1",
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, path: '/'})
      .send({accessToken: accessToken})
  }


  // @TODO: remove refresh token from db
  /** 
   * @description Logout user by clearing its jwt in cookies
   */
  logout(@Req() req: any, @Res() res: any) {
    try {
      res.clearCookie("jwt").end()
    } catch {
      throw new HttpException("Can't update cookies", HttpStatus.BAD_REQUEST)
    }
  }



}
