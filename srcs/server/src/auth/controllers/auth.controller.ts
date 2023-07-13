import { Controller, Get, Req, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { UpdateAuthDto } from '../dto/update-auth.dto';

import axios from 'axios'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

    @Get('redirect')
    redirect(@Body() body: any): string {
      return this.authService.buildRedirectUrl()
    }

    @Get('token')
    async token(@Body() body:any, @Req() req:any) {
      const code = req.query["code"]
      
      try {

        const token_req = await axios.post(
          "https://api.intra.42.fr/oauth/token",
          {
            grant_type: 'authorization_code',
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.SECRET,
            code: code,
            redirect_uri: process.env.REDIRECT_URL
          },
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        )
      
        const token = await token_req.data.access_token;
        console.log(token)

      } catch(error) { 
        console.error(error)
      }
    }


  // @Post()
  // create(@Body() createAuthDto: CreateAuthDto) {
  //   return this.authService.create(createAuthDto);
  // }

  // @Get()
  // findAll() {
  //   return this.authService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
