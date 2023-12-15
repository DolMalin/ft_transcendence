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
        return await this.roomRepository.findOne({where : {name : name}, relations : ['owner', 'administrator', 'users', 'message', 'muted', 'banned']})
    }

    async findOneByIdWithRelations(roomId: number){
        return await this.roomRepository.findOne({where : {id : roomId}, relations : ['owner', 'administrator', 'users', 'message', 'muted', 'banned']})
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
            .leftJoinAndSelect('room.banned', 'banned')
            .leftJoinAndSelect('message.author', 'author')
            .leftJoinAndSelect('room.users', 'user')
            .where('room.name = :name', { name: dto.name })
            .orderBy('message.id', 'ASC')
            .getOne();
        if (!room)
            throw new ForbiddenException('room does not exist')

        if (this.isBanned(room, user))
            throw new ConflictException('Banned user', 
            {cause: new Error(), description: 'you are banned in channel ' + room.name} )

        if (room.privChan === true)
            throw new ForbiddenException(`room ${room.name} is private, you have to be invited first.`)
        if (room.password?.length > 0){
            if (! await argon2.verify(room.password, dto.password))
                throw new ForbiddenException('Password invalid')
        }
        if (room.users === undefined)
            room.users = []
        room.users.push(user)
        this.roomRepository.save(room)
        return room;
    }

    async postMessage(sender: User, dto: CreateMessageDto){
        
        const room = await this.findOneByIdWithRelations(dto.roomId);
        if (!room)
            throw new NotFoundException("Room not found",
            {cause: new Error(), description: "cannot find any users in database"});
        if (this.isMuted(room, sender))
            throw new ConflictException('Muted user', 
            {cause: new Error(), description: 'you are muted in channel ' + room.name} )
        if (this.isBanned(room, sender))
            throw new ConflictException('Banned user', 
            {cause: new Error(), description: 'you are banned in channel ' + room.name} )

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

    async removeAdminPrivileges(requestMaker : User, updatePrivilegesDto : UpdatePrivilegesDto) {
        const room = await this.findOneByNameWithRelations(updatePrivilegesDto.roomName);
        if (!room)
            throw new NotFoundException("Room not found", {cause: new Error(), description: "cannot find any users in database"})
        const target = await this.userService.findOneById(updatePrivilegesDto.targetId)
        if (!target)
            throw new NotFoundException("User not found", {cause: new Error(), description: "cannot find any users in database"})

        if (requestMaker.id !== room.owner.id)
            throw new ConflictException('Is not room owner', 
            {cause: new Error(), description: 'tried to perform action above your paycheck'} )

        if (this.isAdmin(room, target) === 'no')
            throw new ConflictException('Is not admin',  
            {cause: new Error(), description: "Target user allready has no privileges"} )

        room.administrator = room.administrator.filter((admin) => admin.id != target.id);
        return await this.save(room);
    }

    async userPrivileges(updatePrivilegesDto : UpdatePrivilegesDto) {

        const room = await this.findOneByNameWithRelations(updatePrivilegesDto.roomName);
        if (!room)
            throw new NotFoundException("Room not found", {cause: new Error(), description: "cannot find any users in database"})
        const target = await this.userService.findOneById(updatePrivilegesDto.targetId)
        if (!target)
            throw new NotFoundException("User not found", {cause: new Error(), description: "cannot find any users in database"})
        
        if (this.isMuted(room, target))
            return ('isMuted');
        return (this.isAdmin(room, target));
    }

    isMuted(room : Room, user : User)
    {
        if (room.muted?.find((userToFind : User) => userToFind?.id === user?.id))
            return (true);
        return (false);
    }

    isAdmin(room : Room, user : User) {
        
        if (room.administrator?.find((userToFind : User) => userToFind?.id === user?.id))
            return ('isAdmin');
        else if (user.id === room.owner?.id)
            return ('isOwner');
        return ('no');
    }

    isBanned(room : Room, user : User) {
        if (room.banned?.find((userToFind : User) => userToFind?.id === user?.id))
            return (true);
        return (false);
    }

    async muteUser(requestMaker : User,updatePrivilegesDto : UpdatePrivilegesDto, timeInMinutes : number) {

        
        const room = await this.findOneByIdWithRelations(updatePrivilegesDto.roomId);
        if (!room)
            throw new NotFoundException("Room not found", {cause: new Error(), description: "cannot find any users in database"})
        if (!this.isAdmin(room, requestMaker))
            throw new ConflictException('Not an admin', 
            {cause: new Error(), description: 'tried to perform actions above your paycheck'} )

        const target = await this.userService.findOneById(updatePrivilegesDto.targetId);
        if (!target)
            throw new NotFoundException("User not found", {cause: new Error(), description: "cannot find any users in database"})
        if (this.isAdmin(room, target) !== 'no')
            throw new ConflictException('Target is admin', 
            {cause: new Error(), description: 'You cannot mute an admin'} )


        if (timeInMinutes != 0)
        {
            setTimeout(() => {
            if (!room.muted)
                room.muted = [];
            room.muted = room.muted.filter((mutedUser) => mutedUser.id != target.id)
            this.save(room);
            }, timeInMinutes * 60 * 1000);
        }
        if (!room.muted)
            room.muted = [];
        room.muted.push(target);
        return (await this.save(room));
    }

    async unmuteUser(requestMaker : User, updatePrivilegesDto : UpdatePrivilegesDto) {

        const room = await this.findOneByIdWithRelations(updatePrivilegesDto.roomId);
        if (!room)
            throw new NotFoundException("Room not found", {cause: new Error(), description: "cannot find any users in database"});
        if (!this.isAdmin(room, requestMaker))
            throw new ConflictException('Not an admin', 
            {cause: new Error(), description: 'tried to perform actions above your paycheck'} );

        const target = await this.userService.findOneById(updatePrivilegesDto.targetId);
        if (!target)
            throw new NotFoundException("User not found", {cause: new Error(), description: "cannot find any users in database"});
    
        if (!this.isMuted(room, target)) {
            throw new ConflictException('Is not muted', 
            {cause: new Error(), description: 'This user is not muted'} );
        }
        if (!room.muted)
            room.muted = [];
        room.muted = room.muted.filter((mutedUser) => mutedUser.id != target.id)
        return (await this.save(room));
    }

    async banUser(requestMaker : User, updatePrivilegesDto : UpdatePrivilegesDto) {

        const room = await this.findOneByIdWithRelations(updatePrivilegesDto.roomId);
        if (!room)
            throw new NotFoundException("Room not found", {cause: new Error(), description: "cannot find any users in database"});
        if (!this.isAdmin(room, requestMaker))
            throw new ConflictException('Not an admin', 
            {cause: new Error(), description: 'tried to perform actions above your paycheck'} );

        const target = await this.userService.findOneById(updatePrivilegesDto.targetId);
        if (!target)
            throw new NotFoundException("User not found", {cause: new Error(), description: "cannot find any users in database"});

        if (this.isBanned(room, target))
            throw new ConflictException('Banned already', 
            {cause: new Error(), description: target.username + 'is allready banned from ' + room.name});
        if (this.isAdmin(room, target) !== 'no')
            throw new ConflictException('Is Admin', 
            {cause: new Error(), description: target.username + ' has admin privileges in ' + room.name + 'you cannot ban them'});

        
        if (updatePrivilegesDto.timeInMinutes != 0)
        {
            setTimeout(() => {
            if (!room.banned)
                room.banned = [];
            room.banned = room.banned.filter((bannedUser) => bannedUser.id != target.id)
            this.save(room);
            }, updatePrivilegesDto.timeInMinutes * 60 * 1000);
        }
        if(!room.banned)
            room.banned = [];
        room.banned.push(target);
        room.users = room.users.filter((user) => user.id != target.id)
        return (await this.save(room));
    }

    async unbanUser(requestMaker : User, updatePrivilegesDto : UpdatePrivilegesDto) {

        const room = await this.findOneByIdWithRelations(updatePrivilegesDto.roomId);
        if (!room)
            throw new NotFoundException("Room not found", {cause: new Error(), description: "cannot find any users in database"});
        if (!this.isAdmin(room, requestMaker))
            throw new ConflictException('Not an admin', 
            {cause: new Error(), description: 'tried to perform actions above your paycheck'} );

        const target = await this.userService.findOneById(updatePrivilegesDto.targetId);
        if (!target)
            throw new NotFoundException("User not found", {cause: new Error(), description: "cannot find any users in database"});

        if (!this.isBanned(room, target))
            throw new ConflictException('Not banned', 
            {cause: new Error(), description: target.username + 'is not banned from ' + room.name});
    
        if (!room.banned)    
            room.banned = [];
        room.banned = room.banned.filter((bannedUser) => bannedUser.id != target.id)
        return (await this.save(room));
    }

    async getBanList(roomId : number)
    {
        const room = await this.findOneByIdWithRelations(roomId);
        if (!room)
            throw new NotFoundException("Room not found", {cause: new Error(), description: "cannot find any users in database"});

        let banList : {username : string, id : string}[] = []; 
        if (!room.banned)
            room.banned = [];
        room.banned.forEach((bannedUser) => {
            banList.push({username : bannedUser.username, id : bannedUser.id});
        }); 
        return (banList);
    }


    async save(room: Room) {
        const newRoom = await this.roomRepository.save(room);
        if (!newRoom)
          throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'cannot update user'}); 
        return newRoom;
    
    }
}