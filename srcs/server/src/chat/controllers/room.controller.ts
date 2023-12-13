import { Controller, Get, Post, Req, Res, Body, Patch, Param, Delete, UseGuards, HttpStatus, ForbiddenException, HttpCode, HttpException, Logger, NotFoundException } from '@nestjs/common';
import { UpdateRoomDto } from '../dto/update-room.dto';
import { RoomService } from '../services/room.service';
import { Room } from '../entities/room.entity';
import { CreateRoomDto } from '../dto/create-room.dto';
import { AuthService } from 'src/auth/services/auth.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { GetUser } from 'src/users/decorator/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { JoinRoomDto } from '../dto/join-room.dto';
import { AccessToken2FAGuard } from 'src/auth/guards/accessToken2FA.auth.guard';
import { updatePrivilegesDto } from '../dto/update-privileges.dto';
import { UsersService } from 'src/users/services/users.service';


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
    @Get('userlist/:id')
    async getUserList(@Param("id") id: number){
        return await this.roomService.findAllUsersInRoom(id)
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
    async giveAdminPrivileges(@GetUser() user: User, @Body() updatePrivilegesDto : updatePrivilegesDto){
        
        const room = await this.roomService.findOneByNameWithRelations(updatePrivilegesDto.roomName);
        if (!room)
            throw new NotFoundException("Room not found", {cause: new Error(), description: "cannot find any users in database"})
        const target = await this.userService.findOneById(updatePrivilegesDto.targetId)
        if (!target)
            throw new NotFoundException("User not found", {cause: new Error(), description: "cannot find any users in database"})

        if (user.id !== room.owner.id || !this.roomService.isAdmin(room, user))
            Logger.error('non-admin user tried to perform a priviledged action');
        
        if (!room.administrator)
            room.administrator = [];
        room.administrator.push(target);
        return await this.roomService.save(room);
    }

    @UseGuards(AccessToken2FAGuard)
    @Post('hasAdminPrivileges')
    async hasAdminPrivileges(@GetUser() user: User, @Body() updatePrivilegesDto : updatePrivilegesDto){
    
        const room = await this.roomService.findOneByNameWithRelations(updatePrivilegesDto.roomName);
        if (!room)
            throw new NotFoundException("Room not found", {cause: new Error(), description: "cannot find any users in database"})
        const target = await this.userService.findOneById(updatePrivilegesDto.targetId)
        if (!target)
            throw new NotFoundException("User not found", {cause: new Error(), description: "cannot find any users in database"})
        
        return (this.roomService.isAdmin(room, target));
    }

    @UseGuards(AccessToken2FAGuard)
    @Get('message')
    async getMessage(){
        return await this.roomService.getMessage()
    }
    
    @UseGuards(AccessToken2FAGuard)
    @Delete(':id')
    async removeRoom(@Param("id") id: number){
        return await this.roomService.remove(id)
    }
}
