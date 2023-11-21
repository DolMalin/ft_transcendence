import { Controller, Get, Query,Post, Req, Res, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { leaderboardStats } from 'src/game/interfaces/interfaces';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
  
  @Get('scoreList')
  scoreList(): Promise<leaderboardStats[]> {

    return (this.usersService.returnScoreList());
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOneById(id);
  }

  // patch below not working properly

  @Patch()
  update(
    @Req() req:any,
    @Body() updateUserDto: UpdateUserDto)
    : Promise<User> {
      console.log(req.user)
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Patch(':id')
  updateWithId(
    @Req() req:any,
    @Body() updateUserDto: UpdateUserDto,
    @Param('id') id: string)
    : Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete() 
  deleteAll () {

    return (this.usersService.removeAll());
  }
  
  @Delete(':id')
  remove(@Param('id') id: string): Promise<User> {
    return this.usersService.remove(id);
  }



}
