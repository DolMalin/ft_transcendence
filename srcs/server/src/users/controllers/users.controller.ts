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

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly matchHistoryService: MatchHistoryService
    ) {}

  @UseGuards(AccessToken2FAGuard)
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @UseGuards(AccessTokenGuard)
  @Get('current')
  async current(@GetUser() user : User) : Promise<User> {
    return (user);
  }
  
  @UseGuards(AccessTokenGuard)
  @Get('scoreList')
  scoreList(): Promise<leaderboardStats[]> {

    return (this.usersService.returnScoreList());
  }

  @UseGuards(AccessTokenGuard)
  @Get('history/:id')
  history(@Param('id') userId: string) {

    console.log(userId)
      return (this.matchHistoryService.returnHistory(userId));
  }

  @UseGuards(AccessTokenGuard)
  @Get('isAvailable')
  isAvailable(@GetUser() user : User) {
    
    return (user.isAvailable);
  }

  @UseGuards(AccessTokenGuard)
  @Get('myself')
  getMyself(@GetUser() user : User)
  {
    return (user)
  }
  
  @UseGuards(AccessTokenGuard)
  @Patch('updateIsAvailable')
  updateIsAvailable(@GetUser() user : User, @Body() updateDto : UpdateUserDto) {
    
    return (this.usersService.update(user.id, updateDto));
  }


  @UseGuards(AccessTokenGuard)
  @Get('me')
  getUserInfo(@GetUser() user: User){
    console.log("HELLO")
    return {username: user.username, id: user.id}
  }


  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @UseGuards(AccessTokenGuard)
  @Get('avatar/:id')
  async getUserAvatar(@Res({passthrough: true}) res: any, @Param('id') id: string) {
    try {
      const avatar = await this.usersService.getAvatar(id)
      const stream = Readable.from(avatar?.data)
      
      res.set({
        'Content-Disposition':`inline; filename="${avatar?.filename}"`,
        'Content-Type' :'image'
      })
  
      return new StreamableFile(stream)
    }
    catch (e) {
      console.log('get User Avatar : ', e);
      throw Error
    }
  }

  @UseGuards(AccessTokenGuard)
  @Patch()
  update(
    @Req() req:any,
    @Body() updateUserDto: UpdateUserDto)
    : Promise<User> {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('removeGameSocket')
  removeSocket(@GetUser() user : User, @Body() gameSocketId : string) {

    this.usersService.removeSocketId(gameSocketId, user.gameSockets, user);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<User> {

    return this.usersService.remove(id);
  }
}

