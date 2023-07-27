import { Controller, Get, Req,Res,Headers, Body, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UsersService } from 'src/users/services/users.service';
import { FtAuthGuard } from '../guards/ft.auth.guard';

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
      res.status(301).redirect(process.env.CLIENT_URL)
      this.authService.login(req, res)
    }

    // @UseGuards(JwtAuthGuard)
    @Get('logout')
    logout(@Req() req: any, @Res() res: any) {
      return this.authService.logout(req, res)
    }

}
