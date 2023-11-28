import { Controller, Get, Post, Req,Res, Body, Patch, Param, Delete, UseGuards, StreamableFile, ParseIntPipe } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.auth.guard';
import { Readable } from 'stream';
import { leaderboardStats } from 'src/game/globals/interfaces';
import { GetUser } from '../decorator/user.decorator';
import { Socket, io } from 'socket.io-client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  // TO DO : Can't get this to work
  // @UseGuards(AccessTokenGuard)
  // @Get('currentUser')
  // findCurrentUser(@Req() req : any) {
  //   console.log('current user : ', req.user)
  //   return ('feur')
  // }
  @UseGuards(AccessTokenGuard)
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
  @Get('isAvailable')
  isAvailable(@GetUser() user : User) {
    
    return (user.isAvailable);
  }
  @UseGuards(AccessTokenGuard)
  @Get('myself')
  getMyself(@GetUser() user : User)
  {
    console.log('User in getMyself : ', user)
    return (user)
  }
  
  @UseGuards(AccessTokenGuard)
  @Patch('updateIsAvailable')
  updateIsAvailable(@GetUser() user : User, @Body() updateDto : UpdateUserDto) {
    
    return (this.usersService.update(user.id, updateDto));
  }

  @UseGuards(AccessTokenGuard)
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
      // console.log('user in Patch update : ', req.user)
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('removeSocket')
  removeSocket(@GetUser() user : User, @Body() gameSocketId : string) {

    console.log('socket : ',gameSocketId);
    console.log('before : ', user.gameSockets);

    user.gameSockets = user.gameSockets.filter((value) => value != gameSocketId)
    console.log('after : ', user.gameSockets);
    return (this.usersService.update(user.id, { gameSockets : user.gameSockets}))
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<User> {
    return this.usersService.remove(id);
  }
}

