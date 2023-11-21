import { ForbiddenException, Injectable, Req, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { CreateRoomDto } from '../dto/create-room.dto';
import { UpdateRoomDto } from '../dto/update-room.dto';
import { Repository } from 'typeorm'
import { Room } from '../entities/room.entity'
import { User } from '../../users/entities/user.entity'
import { Message } from '../entities/message.entity'
import { HttpException, HttpStatus} from '@nestjs/common'

@Injectable()
export class RoomService {
    
    constructor(
        
        @InjectRepository(Room)
        private roomRepository: Repository<Room>,  
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
        const roomList = await this.findAll()
        let roomExist = roomList.some((obj: { name: string}) => obj.name === req.body?.roomName)
        if (!roomExist)
            throw new ForbiddenException('room does not exist')
        console.log('req', req.body?.roomName)
        const room = roomList.filter(id => id.name !== req.body?.roomName)
        // const room = roomList.find(req.body?.roomName)
        console.log('room',room)
        res.send('ok')
    }
}