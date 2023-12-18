import { HttpException, HttpStatus, Injectable, Logger, Req, Res, UnauthorizedException, InternalServerErrorException, ForbiddenException, BadRequestException, ConflictException} from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import { User } from 'src/users/entities/user.entity';

import axios from 'axios'
import * as argon2 from 'argon2'
import { JwtService } from '@nestjs/jwt'
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode'
import { Avatar } from 'src/users/entities/avatar.entity';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    
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
    if (!newUser)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'Cannot create user'})

    Logger.log(`User ${newUser.id} created`)

    return newUser
  }


  async createAccessToken(payload: {id: string}): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn:'7d'
    })
  }


  async createRefreshToken(payload: {id: string}): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn:'1d'
    })
  }


  async updateRefreshToken(id: string, refreshToken: string) {
    return await this.usersService.update(id, {
      refreshToken: await this.hash(refreshToken)
    })
  }


  async hash(data: string): Promise<string> {
    return argon2.hash(data)
  }


  /**
   * @description Check the validity of a given `jwt`, and returns its `payload`
   */
  async validateAccessJwt(token: string): Promise<any> {
      const payload = await this.jwtService.verifyAsync(token, {secret: process.env.JWT_ACCESS_SECRET})
      return payload
  }


  /**
   * @description Login user by creating a jwt and store it in user's cookies
   */
  async login(req: any, res: any) {
    const refreshToken = await this.createRefreshToken({id: req.user.id})
    const accessToken = await this.createAccessToken({id: req.user.id})
    if (!refreshToken || !accessToken)
      throw new InternalServerErrorException('JWT error', {cause: new Error(), description: 'Cannot create JWT'})

    const user = await this.updateRefreshToken(req.user.id, refreshToken)
    if (!user)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'Cannot update user'})
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      domain: process.env.REACT_APP_SERVER_IP,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, path: '/'})

    res.cookie('accessToken', accessToken, {
      httpOnly: false,
      secure: true,
      domain: process.env.REACT_APP_SERVER_IP,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, path: '/'})

    return res.redirect(process.env.CLIENT_URL)
  }


  async refresh(req: any, res: any) {
    const user = await this.usersService.findOneById(req.user?.id)
    
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access denied', {cause: new Error(), description: `Cannot find user or refresh token`})
    
    if (! await argon2.verify(user.refreshToken, req.cookies?.refreshToken))
      throw new ForbiddenException('Access denied', {cause: new Error(), description: `Refresh token do not match`})


    const refreshToken = await this.createRefreshToken({id: user.id})
    const accessToken = await this.createAccessToken({id: user.id})
    if (!refreshToken || !accessToken)
      throw new InternalServerErrorException('JWT error', {cause: new Error(), description: 'Cannot create JWT'})

    const updatedUser = await this.updateRefreshToken(user.id, refreshToken)
    if (!updatedUser)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'Cannot update user'})

    Logger.log(`Tokens refreshed for user #${user.id}`)

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      domain: process.env.REACT_APP_SERVER_IP,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, path: '/'})

    res.cookie('accessToken', accessToken, {
      httpOnly: false,
      secure: true,
      domain: process.env.REACT_APP_SERVER_IP,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, path: '/'})

    res.send()
  }


  // @TODO: remove refresh token from db
  /** 
   * @description Logout user by clearing its jwt in cookies
   */
  async logout(@Req() req: any, @Res() res: any) {
    const user = await this.usersService.findOneById(req.user?.id)

    if (!user)
      throw new ForbiddenException('Access denied', {cause: new Error(), description: `Cannot find user`})
      
    const updatedUser = await this.usersService.update(user.id, {isTwoFactorAuthenticated: false})
    if (!updatedUser)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'Cannot update user'})
    
      Logger.log(`User #${user.id} logged out`)
      res.clearCookie("refreshToken").status(200).send()

  }
  

  // @TODO: CHECK VALUES IS SEND BACK IN USER
  async validate(@Req() req: any, @Res() res: any) {
    const user = await this.usersService.findOneById(req.user?.id)
    if (!user)
      throw new ForbiddenException('Access denied', {cause: new Error(), description: `Cannot find user`})

    return res.status(200).send(user)
  }

  
  async register(file: Express.Multer.File, dto: UpdateUserDto, res: any, user: User) {

    if (file) {
     const avatar = await this.usersService.addAvatar(user.id, file.buffer, file.originalname)
     if (!avatar)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'Cannot create avatar'})
    }

    if (dto.username?.length > 0 && await this.usersService.findOneByUsername(dto.username))
      throw new ConflictException('Database error', {cause: new Error(), description: 'username already exists'})

    const newUser = await this.usersService.update(user.id, {username: dto.username, isRegistered: true})
    if (!newUser)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'Cannot update user'})

    return res.status(200).send(dto)
  }

  async generateTwoFactorAuthenticationSecret(user: User) {
    const secret = authenticator.generateSecret()
    const otpAuthUrl = authenticator.keyuri(user.id, process.env.APP_NAME, secret)
    const newUser = await this.usersService.update(user.id, {twoFactorAuthenticationSecret:secret})
    if (!newUser)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'Cannot update user'})

    return {secret, otpAuthUrl}
  }

  async generateTwoFactorAuthenticationQRCode(req:any)
  {
    let secret = await this.generateTwoFactorAuthenticationSecret(req.user)
    if (!secret)
      throw new InternalServerErrorException('2fa error', {cause: new Error(), description: 'Cannot generate 2fa secret'})

    let qrCodeDataURL = await this.generateQrCodeDataURL(secret.otpAuthUrl)
    if (!qrCodeDataURL)
      throw new InternalServerErrorException('2fa error', {cause: new Error(), description: 'Cannot generate 2fa qrcode'})

    return qrCodeDataURL
  }

  async twoFactorAuthenticationLogin( req: any,  res:any, body:any) {

    if (!authenticator.verify({secret:req.user.twoFactorAuthenticationSecret, token:body.twoFactorAuthenticationCode}))
      throw new UnauthorizedException('Wrong authentication code', {cause: new Error(), description: 'The 2fa code do not match'})

    const user = await this.usersService.update(req.user.id, {isTwoFactorAuthenticated: true})
    if (!user)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'Cannot update user'})

    return res.status(200).send()
  }
  
  async generateQrCodeDataURL(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl)
  }

  isTwoFactorAuthenticationValid(twoFactorAuthenticationCode: string, user:User) {
    return authenticator.verify({
      token:twoFactorAuthenticationCode,
      secret:user?.twoFactorAuthenticationSecret
    })
  }

  async turnOnTwoFactorAuthentication( req: any,  res:any, body:any) {

    if (!authenticator.verify({secret:req.user.twoFactorAuthenticationSecret, token:body.twoFactorAuthenticationCode}))
      throw new UnauthorizedException('Wrong authentication code', {cause: new Error(), description: 'The 2fa code do not match'})

    const user = await this.usersService.update(req.user.id, {isTwoFactorAuthenticationEnabled: true, isTwoFactorAuthenticated: true})
    if (!user)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'Cannot update user'})

    return res.status(200).send()
  }


  async turnOffTwoFactorAuthentication(req: any, res:any, body:any) {

    if (!authenticator.verify({secret:req.user.twoFactorAuthenticationSecret, token:body.twoFactorAuthenticationCode}))
      throw new UnauthorizedException('Wrong authentication code', {cause: new Error(), description: 'The 2fa code do not match'})

    const user =  await this.usersService.update(req.user.id, {isTwoFactorAuthenticationEnabled: false})
    if (!user)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'Cannot update user'})

    return res.status(200).send()
  }





}
