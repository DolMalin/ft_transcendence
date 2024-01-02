import { Body, Controller, Delete, Get, Logger, Param, Post, UseGuards } from '@nestjs/common';
import { AccessToken2FAGuard } from 'src/auth/guards/accessToken2FA.auth.guard';
import { AuthService } from 'src/auth/services/auth.service';
import { INTParam } from 'src/decorator/decorator';
import { GetUser } from 'src/users/decorator/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/services/users.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { CreateRoomDto } from '../dto/create-room.dto';
import { JoinRoomDto } from '../dto/join-room.dto';
import { UpdatePrivilegesDto } from '../dto/update-privileges.dto';
import { UpdateRoomDto } from '../dto/update-room.dto';
import { RoomService } from '../services/room.service';


@Controller('room')
export class RoomController {
    constructor(
        private readonly roomService: RoomService,
        private readonly authService: AuthService,
        private readonly userService: UsersService
    ){}

    @UseGuards(AccessToken2FAGuard)
    @Post()
    async createRoom(@GetUser() user: User, @Body() createRoomDto: CreateRoomDto){
        if (createRoomDto.password?.length > 0)
            createRoomDto.password = await this.authService.hash(createRoomDto.password)
        
        return await this.roomService.create(createRoomDto, user)
    }

    @UseGuards(AccessToken2FAGuard)
    @Get()
    async getRoomList(){
        return await this.roomService.findAll();
    }

    
    @UseGuards(AccessToken2FAGuard)
    @Get('list')
    async getRoomListWithoutDm(){
        return await this.roomService.findAllWithoutDm();
    }
    
    @UseGuards(AccessToken2FAGuard)
    @Get(':id')
    async getRoom(@Param('id') @INTParam() id: number){

        return await this.roomService.getRoomById(id);
    }

    @UseGuards(AccessToken2FAGuard)
    @Get('userlist/:id')
    async getUserList(@Param("id") @INTParam() id: number){
        
        return await this.roomService.findAllUsersInRoom(id)
    }

    @UseGuards(AccessToken2FAGuard)
    @Get('bannedList/:id')
    async getBanList(@Param("id") @INTParam() id: number) {

        return (await this.roomService.getBanList(id));
    }

    @UseGuards(AccessToken2FAGuard)
    @Get('isPriv/:id')
    async isPriv(@Param("id") @INTParam() id: number) {

        return (await this.roomService.isPriv(id));
    }

    @UseGuards(AccessToken2FAGuard)
    @Get('isInRoom/:id')
    async isInRoom(@GetUser() user : User ,@Param("id") @INTParam() id: number) {

        return (await this.roomService.isInRoom(user ,id));
    }

    @UseGuards(AccessToken2FAGuard)
    @Post('joinRoom')
    async joinRoom(@GetUser() user: User, @Body() dto: JoinRoomDto){
        return await this.roomService.joinRoom(dto, user);
    }

    @UseGuards(AccessToken2FAGuard)
    @Post('message')
    async postMessage(@GetUser() user: User, @Body() dto: CreateMessageDto){
        return await this.roomService.postMessage(user, dto)
    }

    @UseGuards(AccessToken2FAGuard)
    @Post('giveAdminPrivileges')
    async giveAdminPrivileges(@GetUser() user: User, @Body() updatePrivilegesDto : UpdatePrivilegesDto){
        
        return (await this.roomService.giveAdminPrivileges(user, updatePrivilegesDto));

    }

    @UseGuards(AccessToken2FAGuard)
    @Post('removeAdminPrivileges')
    async removeAdminPrivileges(@GetUser() user: User, @Body() updatePrivilegesDto : UpdatePrivilegesDto){
        return (await this.roomService.removeAdminPrivileges(user, updatePrivilegesDto));
    }

    @UseGuards(AccessToken2FAGuard)
    @Post('userPrivileges')
    async hasAdminPrivileges(@Body() updatePrivilegesDto : UpdatePrivilegesDto){
        return (await this.roomService.userPrivileges(updatePrivilegesDto));
    }

    @UseGuards(AccessToken2FAGuard)
    @Post('muteUser')
    async muteUser(@GetUser() user : User, @Body() updatePrivilegesDto : UpdatePrivilegesDto) {

        return (await this.roomService.muteUser(user, updatePrivilegesDto, updatePrivilegesDto.timeInMinutes));
    }

    @UseGuards(AccessToken2FAGuard)
    @Post('banUser')
    async banUser(@GetUser() user : User, @Body() updatePrivilegesDto : UpdatePrivilegesDto) {

        return (await this.roomService.banUser(user, updatePrivilegesDto))
    }
    @UseGuards(AccessToken2FAGuard)
    @Post('unbanUser')
    async unbanUser(@GetUser() user : User, @Body() updatePrivilegesDto : UpdatePrivilegesDto) {

        return (await this.roomService.unbanUser(user, updatePrivilegesDto));
    }

    @UseGuards(AccessToken2FAGuard)
    @Post('unmuteUser')
    async unmuteUser(@GetUser() user : User, @Body() updatePrivilegesDto : UpdatePrivilegesDto) {

        return (await this.roomService.unmuteUser(user, updatePrivilegesDto));
    }
    
    @UseGuards(AccessToken2FAGuard)
    @Post('setPassword')
    async setPassword(@GetUser() user: User, @Body() updateRoomDto: UpdateRoomDto){
        return await this.roomService.setPassword(user, updateRoomDto)
    }
    
    @UseGuards(AccessToken2FAGuard)
    @Post('changePassword')
    async changePassword(@GetUser() user: User, @Body() updateRoomDto: UpdateRoomDto){
        return await this.roomService.changePassword(user, updateRoomDto)
    }
    
    @UseGuards(AccessToken2FAGuard)
    @Post('removePassword')
    async removePassword(@GetUser() user: User, @Body() updateRoomDto: UpdateRoomDto){
        return await this.roomService.removePassword(user, updateRoomDto)
    }

    @UseGuards(AccessToken2FAGuard)
    @Get('message')
    async getMessage(){
        return await this.roomService.getMessage()
    }
    
    @UseGuards(AccessToken2FAGuard)
    @Delete(':id')
    async removeRoom(@Param("id") @INTParam() id: number){
        
        return await this.roomService.remove(id)
    }
}
