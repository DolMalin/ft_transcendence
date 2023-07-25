import { Controller, Get, Req,Res, Body, UseGuards } from '@nestjs/common';
import { FtAuthService } from '../services/ft.auth.service';
import { UsersService } from 'src/users/services/users.service';
import { User } from 'src/users/entities/user.entity'
import { FtAuthGuard } from '../guards/ft.auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly ftAuthService: FtAuthService,
    private readonly usersService: UsersService
  ) { }

    @Get('redirect')
    redirect(@Body() body: any): string {
      return this.ftAuthService.buildRedirectUrl()
    }

    @UseGuards(FtAuthGuard)
    @Get('login')
    async login(@Req() req, @Res() res) {
      res.cookie('access_token', await this.ftAuthService.createJwt({sub: req.user.ftId}))
      res.send("authorized")
    }

}
