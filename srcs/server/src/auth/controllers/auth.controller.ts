import { Controller, Get, Req, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UsersService } from 'src/users/services/users.service';
import { User } from 'src/users/entities/user.entity'



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

    @Get('callback')
    async token(@Body() body:any, @Req() req:any) {
      const token = await this.authService.getFtToken(req.query.code)
      const ftId = await this.authService.getFtId(token)

      const user: User | null = await this.usersService.findOne(ftId)
      if (user) {
        console.log("login")
      } else {
        const newUser = await this.usersService.create({
          ftId: ftId
        })
        console.log("user created!")
      }

    }

}
