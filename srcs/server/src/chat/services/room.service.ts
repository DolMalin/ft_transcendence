import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, Req, Res } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateRoomDto } from '../dto/create-room.dto'
import { UpdateRoomDto } from '../dto/update-room.dto'
import { Repository } from 'typeorm'
import { Room } from '../entities/room.entity'
import { User } from '../../users/entities/user.entity'
import { Message } from '../entities/message.entity'
import { HttpException, HttpStatus } from '@nestjs/common'
import * as argon2 from 'argon2'
import { CreateMessageDto } from '../dto/create-message.dto'
import { UsersService } from 'src/users/services/users.service'
import { roomType} from '../entities/room.entity'
import { JoinRoomDto } from '../dto/join-room.dto'
import { UpdatePrivilegesDto } from '../dto/update-privileges.dto'

@Injectable()
export class RoomService {
    
    constructor(
        
        @InjectRepository(Room)
        private roomRepository: Repository<Room>,
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
        @InjectRepository(Message)
        private userRepository: Repository<User>,
        private readonly userService : UsersService

    ) {}

    async create(createRoomDto: CreateRoomDto, user: User){
        if (await this.findOneByName(createRoomDto.name))
            throw new ConflictException("Channel already exists", {cause: new Error(), description: "channel name is unique, find another one"})
        const room = this.roomRepository.create({
            name: createRoomDto.name,
            password: createRoomDto?.password,
            owner: {id: user.id}
        })
        return await this.roomRepository.save(room);
    }

    async findOneByName(name: string){
        return await this.roomRepository.findOneBy({name})
    }
    
    async findOneByNameWithRelations(name: string){
        return await this.roomRepository.findOne({where : {name : name}, relations : ['owner', 'administrator', 'users', 'message']})
    }

    async createDM(user: User, user2: User, roomName: string){
        let directMessage: Room
        directMessage = this.roomRepository.create({
            name: roomName,
            type: roomType.directMessage,
            users: [user, user2]
        })    
        await this.roomRepository.save(directMessage)
        return this.getRoom(roomName)
    }

    async getRoom(roomName: string){
    
        return await this.roomRepository
            .createQueryBuilder('room')
            .leftJoinAndSelect('room.message', 'message')
            .leftJoinAndSelect('message.author', 'author')
            .leftJoinAndSelect('room.users', 'user')
            .where('room.name = :name', { name: roomName })
            .orderBy('message.id', 'ASC')
            .getOne();
    }
    
    async findAll(){
        return this.roomRepository.find()
    }

    async findAllWithoutDm() {
        let roomList = await this.roomRepository.find()
        roomList = roomList.filter(room => room.type !== roomType.directMessage)
        return roomList
    }

    findOneById(id: number){

        return this.roomRepository.findOneBy({id})
    }
    
    async findAllUsersInRoom(id: number) {
        const room = await this.roomRepository
            .createQueryBuilder('room')
            .leftJoinAndSelect('room.users', 'user')
            .where('room.id = :id', {id})
            .getOne();
    
        if (!room){
            throw new ForbiddenException('room does not exist')
        }
        
        const usersInRoom = room.users.map(user => ({
            id: user.id,
            username: user.username,
        }))
        return usersInRoom;
    }

    async findOneByIdWithRelations(roomId: number){
        return await this.roomRepository.findOne({
            where : {id : roomId}, 
            relations : ['owner', 'administrator', 'users', 'users.blocked', 'message']})
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

    
    async joinRoom(dto: JoinRoomDto, user: User){
        const room = await this.roomRepository
            .createQueryBuilder('room')
            .leftJoinAndSelect('room.message', 'message')
            .leftJoinAndSelect('message.author', 'author')
            .leftJoinAndSelect('room.users', 'user')
            .leftJoinAndSelect('user.blocked', 'blocked')
            .where('room.name = :name', { name: dto.name })
            .orderBy('message.id', 'ASC')
            .getOne();

        const userRelation = await this.userService.findOneByIdWithBlockRelation(user.id)
        console.log(userRelation)
        if (!room)
            throw new ForbiddenException('room does not exist')
        if (room.privChan === true)
            throw new ForbiddenException(`room ${room.name} is private, you have to be invited first.`)
        if (room.password?.length > 0){
            if (! await argon2.verify(room.password, dto.password))
                throw new ForbiddenException('Password invalid')
        }
        if (!room.users)
            room.users = []
        room.users.push(user)
        await this.roomRepository.save(room)
        if (userRelation.blocked && room.message) {
            console.log('allo')
            room.message = room.message.filter(msg => !userRelation.blocked.some(blockedUser => blockedUser.id === msg.author.id));
        }    
        return room;
    }

    // roomList = roomList.filter(room => room.type !== roomType.directMessage)

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

    async giveAdminPrivileges(requestMaker : User, updatePrivilegesDto : UpdatePrivilegesDto) {
        const room = await this.findOneByNameWithRelations(updatePrivilegesDto.roomName);
        if (!room)
            throw new NotFoundException("Room not found", {cause: new Error(), description: "cannot find any users in database"})
        const target = await this.userService.findOneById(updatePrivilegesDto.targetId)
        if (!target)
            throw new NotFoundException("User not found", {cause: new Error(), description: "cannot find any users in database"})

        if (requestMaker.id !== room.owner.id || this.isAdmin(room, requestMaker) === 'no')
            throw new ConflictException('Privileges conflict', 
            {cause: new Error(), description: 'tried to perform action above your paycheck'} )

        if (this.isAdmin(room, target) !== 'no')
            throw new ConflictException('Privileges conflict',  
            {cause: new Error(), description: "Target user allready has privileges"} )

        if (!room.administrator)
            room.administrator = [];
        room.administrator.push(target);
        return await this.save(room);
    }

    async hasAdminPrivileges(updatePrivilegesDto : UpdatePrivilegesDto) {

        const room = await this.findOneByNameWithRelations(updatePrivilegesDto.roomName);
        if (!room)
            throw new NotFoundException("Room not found", {cause: new Error(), description: "cannot find any users in database"})
        if (room.type === roomType.directMessage){
            return "no"
        }
        const target = await this.userService.findOneById(updatePrivilegesDto.targetId)
        if (!target)
            throw new NotFoundException("User not found", {cause: new Error(), description: "cannot find any users in database"})
        
        return (this.isAdmin(room, target));
    }

    isAdmin(room : Room, user : User) {
        
        if (room.administrator?.find((userToFind : User) => userToFind?.id === user?.id))
            return ('isAdmin');
        else if (user.id === room.owner?.id)
            return ('isOwner');
        return ('no');
    }

    async save(room: Room) {
        const newRoom = await this.roomRepository.save(room);
        if (!newRoom)
          throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'cannot update user'}); 
        return newRoom;
    
      }
}