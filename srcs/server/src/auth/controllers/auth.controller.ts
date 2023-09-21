import { Controller, Get, Req,Res,Headers, Body, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UsersService } from 'src/users/services/users.service';
import { FtAuthGuard } from '../guards/ft.auth.guard';
import { AccessTokenGuard } from '../guards/accessToken.auth.guard';
import { RefreshTokenGuard } from '../guards/refreshToken.auth.guard';
import { read } from 'fs';

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
    @Get('login/:code')
    async login(@Req() req: any, @Res() res: any) {
      return await this.authService.login(req, res)
    }

    
    @UseGuards(RefreshTokenGuard)
    @Get('refresh')
    refresh(@Req() req: any, @Res() res: any) {
      return this.authService.refresh(req, res)
    }


    @UseGuards(AccessTokenGuard)
    @Get('logout')
    logout(@Req() req: any, @Res() res: any) {
      return this.authService.logout(req, res)
    }


    @UseGuards(AccessTokenGuard)
    @Get('validate')
    validate(@Req() req: any, @Res() res: any) {
      res.send('ok')
    }

}
