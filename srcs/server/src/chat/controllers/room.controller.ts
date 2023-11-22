import { Controller, Get, Post, Req, Res, Body, Patch, Param, Delete, UseGuards, HttpStatus, ForbiddenException } from '@nestjs/common';
import { UpdateRoomDto } from '../dto/update-room.dto';
import { RoomService } from '../services/room.service';
import { Room } from '../entities/room.entity';
import { CreateRoomDto } from '../dto/create-room.dto';
import { AuthService } from 'src/auth/services/auth.service';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.auth.guard';


@Controller('room')
export class RoomController {
    constructor(
        private readonly roomService: RoomService,
        private readonly authService: AuthService
    ){

    }

    @UseGuards(AccessTokenGuard)
    @Post()
    async createRoom(@Body() createRoomDto: CreateRoomDto){
        console.log('test from createroom')
        if (createRoomDto.password?.length > 0)
            createRoomDto.password = await this.authService.hash(createRoomDto.password)
        return await this.roomService.create(createRoomDto)
    }

    @UseGuards(AccessTokenGuard)
    @Get()
    async getRoomData(){
        return await this.roomService.findAll();
    }

    @UseGuards(AccessTokenGuard)
    @Post('joinRoom')
    async joinRoom(@Req() req: any, @Res() res: any){
        console.log('sender:',req.user)
        // console.log('test from joinroom back')
        return await this.roomService.joinRoom(req, res)
    }

    @UseGuards(AccessTokenGuard)
    @Post('message')
    async postMessage(@Req() req: any, @Res() res: any){
        return await this.roomService.postMessage(req, res)
    }

    @UseGuards(AccessTokenGuard)
    @Delete(':id')
    async removeRoom(@Param("id") id: number){
        return await this.roomService.remove(id)
    }
}