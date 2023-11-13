import { Controller, Get, Post, Req, Res, Body, Patch, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { UpdateRoomDto } from '../dto/update-room.dto';
import { MessageListService } from '../services/messageList.service';
import { Room } from '../entities/room.entity';

@Controller('message')
export class MessageListController {
    constructor(private readonly messageListService: MessageListService){

    }

    @Post()
    async createRoom(createRoomDto: {message: string}){
        return await this.messageListService.create(createRoomDto)
    }

    @Get()
    async getMessageData(){
        return await this.messageListService.findAll();
    }

//     @Delete()
//     async removeRoom(@Req() req: any){
//         return await this.messageListService.remove(req.body.id)
//     }

    @Delete(':id')
    async removeRoom(@Param("id") id: number){
        return await this.messageListService.remove(id)
    }
}