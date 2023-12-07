import { Controller, Get, Post, Req, Res, Body, Patch, Param, Delete, UseGuards, HttpStatus, ForbiddenException, HttpCode } from '@nestjs/common';
import { UpdateRoomDto } from '../dto/update-room.dto';
import { RoomService } from '../services/room.service';
import { Room } from '../entities/room.entity';
import { CreateRoomDto } from '../dto/create-room.dto';
import { AuthService } from 'src/auth/services/auth.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { GetUser } from 'src/users/decorator/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { RoomDto } from '../dto/room.dto';
import { AccessToken2FAGuard } from 'src/auth/guards/accessToken2FA.auth.guard';


@Controller('room')
export class RoomController {
    constructor(
        private readonly roomService: RoomService,
        private readonly authService: AuthService
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
    @Get('userlist/:id')
    async getUserList(@Param("id") id: number){
        return await this.roomService.findAllUsersInRoom(id)
    }

    @UseGuards(AccessToken2FAGuard)
    @Post('joinRoom')
    async joinRoom(@GetUser() user: User, @Body() dto: RoomDto){
        return await this.roomService.joinRoom(dto, user);
    }

    @UseGuards(AccessToken2FAGuard)
    @Post('message')
    async postMessage(@GetUser() user: User, @Body() dto: CreateMessageDto){
        return await this.roomService.postMessage(user, dto)
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