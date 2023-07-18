import { Controller, Get, Req, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from '../services/auth.service';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

    @Get('redirect')
    redirect(@Body() body: any): string {
      return this.authService.buildRedirectUrl()
    }

    @Get('token')
    async token(@Body() body:any, @Req() req:any) {
      const token = await this.authService.get42Token(req.query.code)
      const login = await this.authService.get42Id(token)
      console.log(login)
    }

}
