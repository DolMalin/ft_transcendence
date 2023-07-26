import { Controller, Get, Post, Req, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // To remove in production
  // @Post()
  // async create(@Body() createUserDto: CreateUserDto): Promise<User> {
  //   return await this.usersService.create(createUserDto);
  // }
  //
  
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @UseGuards(JwtAuthGuard)
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
