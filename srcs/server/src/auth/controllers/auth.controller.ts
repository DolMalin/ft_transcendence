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
import { HttpCode } from '@nestjs/common';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { GetUser } from 'src/users/decorator/user.decorator';
import { User } from 'src/users/entities/user.entity';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
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
      return await this.authService.validate(req, res)
    }

    @UseInterceptors(FileInterceptor('file'))
    @UseGuards(AccessTokenGuard)
    @Post('register')
    async register(
      @UploadedFile(
        new FileTypeValidationPipe()
      ) file: Express.Multer.File,
      @Body() dto: UpdateUserDto,
      @Res() res:any,
      @GetUser() user : User
      )
    {
      return await this.authService.register(file, dto, res, user)
    }


    @UseGuards(AccessTokenGuard)
    @Get('2fa/generate')
    async generateTwoFactorAuthenticationQRCode(@Req() req:any) {
      return await this.authService.generateTwoFactorAuthenticationQRCode(req)
    }

    @UseGuards(AccessTokenGuard)
    @Post('2fa/login')
    async twoFactorAuthenticationLogin(@Req() req: any, @Res() res:any, @Body() body:any) {
      return await this.authService.twoFactorAuthenticationLogin(req, res, body)
    }

    @UseGuards(AccessTokenGuard)
    @Post('2fa/turn-on')
    async turnOnTwoFactorAuthentication(@Req() req: any, @Res() res:any, @Body() body:any) {
      return await this.authService.turnOnTwoFactorAuthentication(req, res, body)
    }

    @UseGuards(AccessTokenGuard)
    @Post('2fa/turn-off')
    async turnOffTwoFactorAuthentication(@Req() req: any, @Res() res:any, @Body() body:any) {
      return await this.authService.turnOffTwoFactorAuthentication(req, res, body)
    }
}
