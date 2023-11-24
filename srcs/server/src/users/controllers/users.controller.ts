import { Controller, Get, Post, Req,Res, Body, Patch, Param, Delete, UseGuards, StreamableFile, ParseIntPipe } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.auth.guard';
import { Readable } from 'stream';
import { leaderboardStats } from 'src/game/globals/interfaces';
import { GetUser } from '../decorator/user.decorator';

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
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
  
  @Get('scoreList')
  scoreList(): Promise<leaderboardStats[]> {

    return (this.usersService.returnScoreList());
  }

  @UseGuards(AccessTokenGuard)
  @Get('myself')
  getMyself(@GetUser() user : User)
  {
    console.log('User in getMyself : ', user)
    return (user)
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Get('avatar/:id')
  async getUserAvatar(@Res({passthrough: true}) res: any, @Param('id') id: string) {
    const avatar = await this.usersService.getAvatar(id)
    const stream = Readable.from(avatar.data)
    console.log('avatar :', avatar.data)
    
    res.set({
      'Content-Disposition':`inline; filename="${avatar.filename}"`,
      'Content-Type' :'image'
    })

    return new StreamableFile(stream)

  }

  @Patch()
  update(
    @Req() req:any,
    @Body() updateUserDto: UpdateUserDto)
    : Promise<User> {
      console.log('user in Patch update : ', req.user)
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<User> {
    return this.usersService.remove(id);
  }



}

