import { Body, Controller, Get, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'src/users/decorator/user.decorator';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { User } from 'src/users/entities/user.entity';
import { AccessTokenGuard } from '../guards/accessToken.auth.guard';
import { AccessToken2FAGuard } from '../guards/accessToken2FA.auth.guard';
import { FtAuthGuard } from '../guards/ft.auth.guard';
import { RefreshToken2FAGuard } from '../guards/refreshToken2FA.auth.guard';
import { AuthService } from '../services/auth.service';
import { FileTypeValidationPipe } from '../utils/file.validator';
import {ThrottlerGuard} from '@nestjs/throttler'
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

    @Get('redirect')
    @UseGuards(ThrottlerGuard)
    redirect(): object {
      return this.authService.buildRedirectUrl()
    }

    @UseGuards(FtAuthGuard)
    @UseGuards(ThrottlerGuard)
    @Get('login')
    async login(@GetUser() user: User, @Res() res: any) {
      return await this.authService.login(user, res)
    }

    @UseGuards(RefreshToken2FAGuard)
    @UseGuards(ThrottlerGuard)
    @Get('refresh')
    refresh(@GetUser() user: User, @Res() res: any) {
      return this.authService.refresh(user, res)
    }

    @UseGuards(AccessTokenGuard)
    @UseGuards(ThrottlerGuard)
    @Post('logout')
    logout(@GetUser() user: User, @Res() res: any) {
      return this.authService.logout(user, res)
    }

    @UseGuards(AccessTokenGuard)
    @UseGuards(ThrottlerGuard)
    @Get('validate')
    async validate(@GetUser() user: User, @Res() res: any) {
      return await this.authService.validate(user, res)
    }

    @UseInterceptors(FileInterceptor('file'))
    @UseGuards(AccessTokenGuard)
    @UseGuards(ThrottlerGuard)
    @Post('register')
    async register(
      @UploadedFile(
        new FileTypeValidationPipe()
      ) file: Express.Multer.File,
      @Body() dto: UpdateUserDto,
      @Res() res:Request,
      @GetUser() user : User
      )
    {
      return await this.authService.register(file, dto, res, user)
    }

    @UseGuards(AccessTokenGuard)
    @UseGuards(ThrottlerGuard)
    @Get('2fa/generate')
    async generateTwoFactorAuthenticationQRCode(@GetUser() user:User) {
      return await this.authService.generateTwoFactorAuthenticationQRCode(user)
    }

    @UseGuards(AccessTokenGuard)
    @UseGuards(ThrottlerGuard)
    @Post('2fa/login')
    async twoFactorAuthenticationLogin(@GetUser() user: User, @Res() res:any, @Body() body:any) {
      return await this.authService.twoFactorAuthenticationLogin(user, res, body)
    }

    @UseGuards(AccessToken2FAGuard)
    @UseGuards(ThrottlerGuard)
    @Post('2fa/logout')
    logout2fa(@GetUser() user: User, @Res() res: any) {
      return this.authService.logout(user, res)
    }

    @UseGuards(AccessTokenGuard)
    @UseGuards(ThrottlerGuard)
    @Post('2fa/turn-on')
    async turnOnTwoFactorAuthentication(@GetUser() user: User, @Res() res:any, @Body() body:any) {
      return await this.authService.turnOnTwoFactorAuthentication(user, res, body)
    }

    @UseGuards(AccessTokenGuard)
    @UseGuards(ThrottlerGuard)
    @Post('2fa/turn-off')
    async turnOffTwoFactorAuthentication(@GetUser() user: User, @Res() res:any, @Body() body:any) {
      return await this.authService.turnOffTwoFactorAuthentication(user, res, body)
    }
}
