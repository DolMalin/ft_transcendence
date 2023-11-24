import { Controller, Get, Post, Req, Body, Patch, Param, Delete, UseGuards, Res } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.auth.guard';
import { GetUser } from '../decorator/user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // To remove in production
  // @Post()
  // async create(@Body() createUserDto: CreateUserDto): Promise<User> {
  //   return await this.usersService.create(createUserDto);
  // }      
  
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }


  @UseGuards(AccessTokenGuard)
  @Get('me')
  getUserInfo(@GetUser() user: User){
    return {username: user.username, id: user.id}
  }


  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Patch()
  update(
    @Req() req:any,
    @Body() updateUserDto: UpdateUserDto)
    : Promise<User> {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<User> {
    return this.usersService.remove(id);
  }
}
