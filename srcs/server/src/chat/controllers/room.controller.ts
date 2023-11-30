import { Controller, Get, Post, Req, Res, Body, Patch, Param, Delete, UseGuards, HttpStatus, ForbiddenException, HttpCode } from '@nestjs/common';
import { UpdateRoomDto } from '../dto/update-room.dto';
import { RoomService } from '../services/room.service';
import { Room } from '../entities/room.entity';
import { CreateRoomDto } from '../dto/create-room.dto';
import { AuthService } from 'src/auth/services/auth.service';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.auth.guard';
import { CreateMessageDto } from '../dto/create-message.dto';
import { GetUser } from 'src/users/decorator/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { RoomDto } from '../dto/room.dto';


@Controller('room')
export class RoomController {
    constructor(
        private readonly roomService: RoomService,
        private readonly authService: AuthService
    ){

    }

    @UseGuards(AccessTokenGuard)
    @Post()
    async createRoom(@GetUser() user: User, @Body() createRoomDto: CreateRoomDto){
        if (createRoomDto.password?.length > 0)
            createRoomDto.password = await this.authService.hash(createRoomDto.password)
        return await this.roomService.create(createRoomDto, user)
    }

    @UseGuards(AccessTokenGuard)
    @Get()
    async getRoomList(){
        return await this.roomService.findAll();
    }

    @UseGuards(AccessTokenGuard)
    @Get('userlist')
    async getUserList(){
        return await this.roomService.findAllUsers()
    }

    @UseGuards(AccessTokenGuard)
    @Post('joinRoom')
    async joinRoom(@GetUser() user: User, @Body() dto: RoomDto){
        return await this.roomService.joinRoom(dto);
    }

    @UseGuards(AccessTokenGuard)
    @HttpCode(200)
    @Post('message')
    async postMessage(@GetUser() user: User, @Body() dto: CreateMessageDto){
        return await this.roomService.postMessage(user, dto)
    }

    @Get('message')
    async getMessage(){
        return await this.roomService.getMessage()
    }
    
    @UseGuards(AccessTokenGuard)
    @Delete(':id')
    async removeRoom(@Param("id") id: number){
        return await this.roomService.remove(id)
    }
}