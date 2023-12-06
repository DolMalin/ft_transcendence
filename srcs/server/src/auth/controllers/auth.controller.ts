import { Controller, Get, Post, Req,Res,Headers, Body, UseGuards, UploadedFile, UnauthorizedException, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, ParseFilePipeBuilder, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UsersService } from 'src/users/services/users.service';
import { FtAuthGuard } from '../guards/ft.auth.guard';
import { AccessToken2FAGuard } from '../guards/accessToken2FA.auth.guard';
import { AccessTokenGuard } from '../guards/accessToken.auth.guard';
import { RefreshToken2FAGuard } from '../guards/refreshToken2FA.auth.guard';
import { UseInterceptors} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { read } from 'fs';
import { authenticator } from 'otplib';
import { FileTypeValidationPipe } from '../utils/file.validator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) { }

    @Get('redirect')
    redirect(): object {
      return this.authService.buildRedirectUrl()
    }

    @UseGuards(FtAuthGuard)
    @Get('login')
    async login(@Req() req: any, @Res() res: any) {
      return await this.authService.login(req, res)
    }

    @UseGuards(RefreshToken2FAGuard)
    @Get('refresh')
    refresh(@Req() req: any, @Res() res: any) {
      return this.authService.refresh(req, res)
    }

    @UseGuards(AccessToken2FAGuard)
    @Get('logout-2fa')
    logout2fa(@Req() req: any, @Res() res: any) {
      return this.authService.logout(req, res)
    }

    @UseGuards(AccessTokenGuard)
    @Get('logout')
    logout(@Req() req: any, @Res() res: any) {

      return this.authService.logout(req, res)
    }


    @UseGuards(AccessTokenGuard)
    @Get('validate')
    async validate(@Req() req: any, @Res() res: any) {
      const user = await this.authService.validate(req, res)
      res.send(user)
    }

    @UseInterceptors(FileInterceptor('file'))
    @UseGuards(AccessTokenGuard)
    @Post('register')
    async register(
      @UploadedFile(
        new FileTypeValidationPipe()
      ) file: Express.Multer.File,
      @Body() body:any,
      @Res() res:any,
      @Req() req:any)
    {
      if (file)
        await this.usersService.addAvatar(req.user.id, file.buffer, file.originalname)
        
      await this.usersService.update(req.user.id, {username: body.username, isRegistered: true})
      res.send("ok")
    }


    @UseGuards(AccessTokenGuard)
    @Get('2fa/generate')
    async generateTwoFactorAuthenticationQRCode(@Req() req:any) {
      let user = await this.authService.generateTwoFactorAuthenticationSecret(req.user)
      let qrCodeDataURL = await this.authService.generateQrCodeDataURL(user.otpAuthUrl)
      return qrCodeDataURL
    }


    @UseGuards(AccessTokenGuard)
    @Post('2fa/login')
    async twoFactorAuthenticationLogin(@Req() req: any, @Res() res:any, @Body() body:any) {

      if (!authenticator.verify({secret:req.user.twoFactorAuthenticationSecret, token:body.twoFactorAuthenticationCode}))
        throw new UnauthorizedException('Wrong authentication code')

      await this.usersService.update(req.user.id, {isTwoFactorAuthenticated: true})
      res.send("OK")
    }

    @UseGuards(AccessTokenGuard)
    @Post('2fa/turn-on')
    async turnOnTwoFactorAuthentication(@Req() req: any, @Res() res:any, @Body() body:any) {

      if (!authenticator.verify({secret:req.user.twoFactorAuthenticationSecret, token:body.twoFactorAuthenticationCode}))
        throw new UnauthorizedException('Wrong authentication code')
      

      await this.usersService.update(req.user.id, {isTwoFactorAuthenticationEnabled: true, isTwoFactorAuthenticated: true})
      res.send("OK")
    }

    @UseGuards(AccessTokenGuard)
    @Post('2fa/turn-off')
    async turnOffTwoFactorAuthentication(@Req() req: any, @Res() res:any, @Body() body:any) {

      if (!authenticator.verify({secret:req.user.twoFactorAuthenticationSecret, token:body.twoFactorAuthenticationCode}))
        throw new UnauthorizedException('Wrong authentication code')

      await this.usersService.update(req.user.id, {isTwoFactorAuthenticationEnabled: false})
      res.send("OK")
    }


}
