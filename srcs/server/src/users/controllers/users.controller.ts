import { Body, Controller, Delete, Get, Param, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AccessToken2FAGuard } from 'src/auth/guards/accessToken2FA.auth.guard';
import { FRIDParam, FRuserIdParam, UUIDParam } from 'src/decorator/decorator';
import { leaderboardStats } from 'src/game/globals/interfaces';
import { MatchHistoryService } from 'src/game/services/match.history.services';
import { GetUser } from '../decorator/user.decorator';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly matchHistoryService: MatchHistoryService,
    ) {}

    
  @UseGuards(AccessToken2FAGuard)
  @Get()
  async findAll(@GetUser() user: User) {
    return await this.usersService.findAllUsers(user);
  }

  @UseGuards(AccessToken2FAGuard)
  @Get('scoreList')
  scoreList(): Promise<leaderboardStats[]> {
    return (this.usersService.returnScoreList());
  }

  @UseGuards(AccessToken2FAGuard)
  @Get('history/:id')
  history(@Param('id') @UUIDParam() userId: string) {
    return (this.matchHistoryService.returnHistory(userId));
  }

  @UseGuards(AccessToken2FAGuard)
  @Get('profile/:id')
  profile(@Param('id') @UUIDParam() userId: string) {
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
  async findOne(@Param('id') @UUIDParam() id: string) {
    const user = await this.usersService.findOneById(id)
    return this.usersService.removeProtectedProperties(user)
  }

  @UseGuards(AccessToken2FAGuard)
  @Get('avatar/:id')
  async getUserAvatar(@Res({passthrough: true}) res: Request, @Param('id') @UUIDParam() id: string) {
    return this.usersService.getUserAvatar(res, id)
  }

  @UseGuards(AccessToken2FAGuard)
  @Patch()
  update(
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto){
    return this.usersService.update(user.id, updateUserDto);
  }

  @UseGuards(AccessToken2FAGuard)
  @Patch('removeGameSocket')
  async removeSocket(@GetUser() user : User, @Body() gameSocketId : string) {
    return await this.usersService.removeSocketId(gameSocketId, user.gameSockets, user);
  }

  @UseGuards(AccessToken2FAGuard)
  @Post('block/:id')
  async blockTarget(@GetUser() user: User, @Param('id') @UUIDParam() targetId: string){
    return await this.usersService.blockTarget(user.id, targetId)
  }

  @UseGuards(AccessToken2FAGuard)
  @Get('isBlocked/:id')
  async isBlocked(@GetUser() user: User, @Param('id') @UUIDParam() targetId: string){

    return await this.usersService.isBlocked(user, targetId);
  }

  @UseGuards(AccessToken2FAGuard)
  @Delete(':id')
  async remove(@Param('id') @UUIDParam() userId: string) {
    return await this.usersService.remove(userId);
  }

  // ==================================================================== //
  // ======================== FRIENDS REQUEST =========================== //
  // ==================================================================== /

  @UseGuards(AccessToken2FAGuard)
  @Post('friendRequest/send/:receiverId')
  async sendFriendRequest(@Param('receiverId') @FRuserIdParam() receiverId: string, @GetUser() user: User, @Res() res:any) {
    return await this.usersService.sendFriendRequest(receiverId, user, res)
  }

  @UseGuards(AccessToken2FAGuard)
  @Get('friendRequest/:receiverId')
  async getFriendRequest(@Param('receiverId') @FRuserIdParam() receiverId: string, @GetUser() user: User, @Res() res:any) {
    return await this.usersService.getFriendRequest(receiverId, user, res)
  }

  @UseGuards(AccessToken2FAGuard)
  @Patch('friendRequest/response/:friendRequestId')
  async respondToFriendRequest(@Param('friendRequestId') @FRIDParam() friendRequestId: number, @Body() body: any, @Res() res: Request) {
    return await this.usersService.respondToFriendRequest(friendRequestId, body.status, res)
  }

  @UseGuards(AccessToken2FAGuard)
  @Patch('friendRequest/remove/:friendRequestId')
  async removeFriend(@Param('friendRequestId') @FRIDParam() friendRequestId: number,  @Res() res: Request) {
    return await this.usersService.removeFriend(friendRequestId, res)
  }

  @UseGuards(AccessToken2FAGuard)
  @Get('friendRequest/me/received')
  async getFriendRequestsFromRecipients(@GetUser() user: User, @Res() res:any) {
    return await this.usersService.getFriendRequestFromRecipients(user, res)
  }

  @UseGuards(AccessToken2FAGuard)
  @Get('friendRequest/me/sent')
  async getFriendRequestsFromSender(@GetUser() user: User, @Res() res:any) {
    return await this.usersService.getFriendRequestFromSender(user, res)
  }

  @UseGuards(AccessToken2FAGuard)
  @Get('friendRequest/all')
  async getAllFriendRequest(@GetUser() user: User, @Res() res:any) {
    return await this.usersService.getAllFriendRequests(user, res)
  }

  @UseGuards(AccessToken2FAGuard)
  @Get('friend/isFriend/:id')
  async isFriend(@Param('id') @UUIDParam() targetUserId: string, @GetUser() originalUser: User, @Res() res:any) {
    return await this.usersService.isFriend(targetUserId, originalUser)
  }

  @UseGuards(AccessToken2FAGuard)
  @Get('friends/all')
  async getFriends(@GetUser() user: User, @Res() res:any) {
    return await this.usersService.getFriends(user, res)
  }

  @UseGuards(AccessToken2FAGuard)
  @Get('friends/allRequests')
  async getAllRequests(@GetUser() user: User, @Res() res:any) {
    
    return await this.usersService.getRequests(user, res)
  }
}
