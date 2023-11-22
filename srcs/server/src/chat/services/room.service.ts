import { ForbiddenException, Injectable, Req, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { CreateRoomDto } from '../dto/create-room.dto';
import { UpdateRoomDto } from '../dto/update-room.dto';
import { Repository } from 'typeorm'
import { Room } from '../entities/room.entity'
import { User } from '../../users/entities/user.entity'
import { Message } from '../entities/message.entity'
import { HttpException, HttpStatus} from '@nestjs/common'
import * as argon2 from 'argon2'
import { CreateMessageDto } from '../dto/create-message.dto';

@Injectable()
export class RoomService {
    
    constructor(
        
        @InjectRepository(Room)
        private roomRepository: Repository<Room>,
        @InjectRepository(Message)
        private messageRepository: Repository<Message>
    ) {}

    async create(createRoomDto: CreateRoomDto) {
        const newRoom = this.roomRepository.create(createRoomDto)
        return await this.roomRepository.save(newRoom)
    }

    // async createMsg(user: User, msgContent: string){
    //     const msg =  this.msgRepository.create({
    //         content: msgContent,
    //         author: user,
    //         send_at: new Date (),
    //     })
    // }

    findAll() {
        return this.roomRepository.find();
    }

    findOneById(id: number){
        return this.roomRepository.findOneBy({id})
    }

    async update(id: number, updateRoomDto: UpdateRoomDto) {
        await this.roomRepository.update(id, updateRoomDto)
        const newRoom = await this.findOneById(id)
        if (newRoom)
          return newRoom
        throw new HttpException('Room not found', HttpStatus.NOT_FOUND)
    }
    
    async remove(id: number) {
        const room = await this.findOneById(id)
        return this.roomRepository.remove(room)
    }
    
    async joinRoom(req: any, res: any){
        let roomList = await this.findAll()
        let roomExist = roomList.some((obj: { name: string}) => obj.name === req.body?.roomName)
        if (!roomExist)
            throw new ForbiddenException('room does not exist')
        const room = roomList.filter(room => room.name == req.body?.roomName)
        if (room[0].privChan === true)
            throw new ForbiddenException(`room ${room[0].name} is private, you have to be invited first.`)
        // if (! await argon2.verify(room[0]?.password, req.body?.password))
        //     throw new ForbiddenException('Password invalid')
        res.send('ok')
    }

    async postMessage(req: any, res: any){

        let dto: CreateMessageDto;
        dto = req.body;
        console.log('dto', dto)
        console.log('req.body', req.body)
        const msg = this.messageRepository.create(dto)
        return await this.messageRepository.save(dto)
    }
}