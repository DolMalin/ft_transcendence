import { Controller, Get, Req,Res, Body, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UsersService } from 'src/users/services/users.service';
import { User } from 'src/users/entities/user.entity'
import { LocalAuthGuard } from '../guards/local.auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) { }

    @Get('redirect')
    redirect(@Body() body: any): string {
      return this.authService.buildRedirectUrl()
    }

    
    @UseGuards(LocalAuthGuard)
    @Get('login')
    async login(@Req() req, @Res() res) {
      res.cookie('access_token', await this.authService.createJwt({sub: req.user.ftId}))
      res.send("authorized")
    }

}
