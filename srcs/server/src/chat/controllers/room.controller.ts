import { Controller, Get, Post, Req, Res, Body, Patch, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { UpdateRoomDto } from '../dto/update-room.dto';
import { RoomService } from '../services/room.service';
import { Room } from '../entities/room.entity';
import { CreateRoomDto } from '../dto/create-room.dto';
import { AuthService } from 'src/auth/services/auth.service';


@Controller('room')
export class RoomController {
    constructor(
        private readonly roomService: RoomService,
        private readonly authService: AuthService
    ){

    }

    @Post()
    async createRoom(@Body() createRoomDto: CreateRoomDto){
        console.log(createRoomDto)
        if (createRoomDto.password?.length > 0)
            createRoomDto.password = await this.authService.hash(createRoomDto.password)
        return await this.roomService.create(createRoomDto)
    }

    @Get()
    async getRoomData(){
        return await this.roomService.findAll();
    }

//     @Delete()
//     async removeRoom(@Req() req: any){
//         return await this.roomService.remove(req.body.id)
//     }
    @Delete(':id')
    async removeRoom(@Param("id") id: number){
        return await this.roomService.remove(id)
    }
}