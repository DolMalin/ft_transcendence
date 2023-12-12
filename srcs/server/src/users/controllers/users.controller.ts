import { Controller, Get, Post, Req,Res, Body, Patch, Param, Delete, UseGuards, StreamableFile, ParseIntPipe } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { AccessToken2FAGuard } from 'src/auth/guards/accessToken2FA.auth.guard';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.auth.guard';
import { Readable } from 'stream';
import { leaderboardStats } from 'src/game/globals/interfaces';
import { GetUser } from '../decorator/user.decorator';
import { MatchHistoryService } from 'src/game/services/match.history.services';
import { isUUID } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly matchHistoryService: MatchHistoryService,
    ) {}

  @UseGuards(AccessToken2FAGuard)
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }


  
  @UseGuards(AccessToken2FAGuard)
  @Get('scoreList')
  scoreList(): Promise<leaderboardStats[]> {
    return (this.usersService.returnScoreList());
  }

  @UseGuards(AccessToken2FAGuard)
  @Get('history/:id')
  history(@Param('id') userId: string) {
      return (this.matchHistoryService.returnHistory(userId));
  }

  @UseGuards(AccessToken2FAGuard)
  @Get('profile/:id')
  profile(@Param('id') userId: string) {

      return (this.usersService.returnProfile(userId));
  }

  @UseGuards(AccessToken2FAGuard)
  @Get('isAvailable')
  isAvailable(@GetUser() user : User) {
    return (user.isAvailable);
  }

 
  
  @UseGuards(AccessToken2FAGuard)
  @Patch('updateIsAvailable')
  updateIsAvailable(@GetUser() user : User, @Body() updateDto : UpdateUserDto) {
    return (this.usersService.update(user.id, updateDto));
  }


  @UseGuards(AccessToken2FAGuard)
  @Get('me')
  getUserInfo(@GetUser() user: User){
    return {username: user?.username, id: user?.id}
  }


  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @UseGuards(AccessToken2FAGuard)
  @Get('avatar/:id')
  async getUserAvatar(@Res({passthrough: true}) res: any, @Param('id') id: string) {
    return this.usersService.getUserAvatar(res, id)
  }

  @UseGuards(AccessToken2FAGuard)
  @Patch()
  update(
    @Req() req:any,
    @Body() updateUserDto: UpdateUserDto)
    : Promise<User> {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @UseGuards(AccessToken2FAGuard)
  @Patch('removeGameSocket')
  async removeSocket(@GetUser() user : User, @Body() gameSocketId : string) {
    return await this.usersService.removeSocketId(gameSocketId, user.gameSockets, user);
  }

  @UseGuards(AccessToken2FAGuard)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<User> {
    return this.usersService.remove(id);
  }
}
