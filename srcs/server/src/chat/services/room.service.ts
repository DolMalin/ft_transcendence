import { ForbiddenException, Injectable, Req, Res } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateRoomDto } from '../dto/create-room.dto'
import { UpdateRoomDto } from '../dto/update-room.dto'
import { FindOptionsOrder, Repository } from 'typeorm'
import { Room } from '../entities/room.entity'
import { User } from '../../users/entities/user.entity'
import { Message } from '../entities/message.entity'
import { HttpException, HttpStatus } from '@nestjs/common'
import * as argon2 from 'argon2'
import { CreateMessageDto } from '../dto/create-message.dto'
import { RoomDto } from '../dto/room.dto'

@Injectable()
export class RoomService {
    
    constructor(
        
        @InjectRepository(Room)
        private roomRepository: Repository<Room>,
        @InjectRepository(Message)
        private messageRepository: Repository<Message>
    ) {}

    // async create(createRoomDto: CreateRoomDto) {
    //     const newRoom = this.roomRepository.create(createRoomDto)
    //     return await this.roomRepository.save(newRoom)
    // }

    async create(createRoomDto: CreateRoomDto, user: User){
        const room = this.roomRepository.create({
            name: createRoomDto.name,
            password: createRoomDto?.password,
            owner: {id: user.id}
        })
        return await this.roomRepository.save(room);
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
    
    async joinRoom(dto: RoomDto){         console.log("TESTTTTTTTTTTTTTT")

        console.log('dto', dto)
        const room = await this.roomRepository
            .createQueryBuilder('room')
            .leftJoinAndSelect('room.message', 'message')
            .leftJoinAndSelect('message.author', 'author')
            .where('room.name = :name', { name: dto.name })
            .orderBy('message.id', 'ASC')
            .getOne();
        if (!room)
            throw new ForbiddenException('room does not exist')
        if (room.privChan === true)
            throw new ForbiddenException(`room ${room.name} is private, you have to be invited first.`)
        if (room.password?.length > 0){
            if (! await argon2.verify(room.password, dto.password))
                throw new ForbiddenException('Password invalid')
        }
        return room;
    }

    async postMessage(sender: User, dto: CreateMessageDto){
        
        const msg = this.messageRepository.create({
            author: {id: sender.id , username: dto.authorName},
            content: dto.content,
            room: {id: dto.roomId}
        })
        return await this.messageRepository.save(msg)
    }

    async getMessage(){
        const msgList = await this.messageRepository.find()
        msgList.reverse()
        return msgList
    }
}