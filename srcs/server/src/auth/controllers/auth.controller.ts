import { Controller, Get, Req, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from '../services/auth.service';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

    @Get('redirect')
    redirect(@Body() body: any): string {
      return this.authService.buildRedirectUrl()
    }

    @Get('callback')
    async token(@Body() body:any, @Req() req:any) {
      const token = await this.authService.getFtToken(req.query.code)
      const login = await this.authService.getFtId(token)
      console.log(login)
    }

}
