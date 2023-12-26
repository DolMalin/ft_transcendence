import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException, Req, Res } from '@nestjs/common'
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
import { AuthService } from 'src/auth/services/auth.service';
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
        private readonly userService : UsersService,
        private readonly authService : AuthService
    ) {}

    async create(createRoomDto: CreateRoomDto, user: User){
        if (await this.findOneByName(createRoomDto.name))
            throw new ConflictException("Channel already exists", {cause: new Error(), description: "channel name is unique, find another one"})
        const room = this.roomRepository.create({
            name: createRoomDto.name,
            password: createRoomDto?.password,
            owner: {id: user.id},
            type: roomType.groupMessage,
            privChan: createRoomDto.privChan
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
        return await this.roomRepository.findOne(
        {
            where : 
            {id : roomId}, 
            relations : 
            [
                'owner', 
                'administrator', 
                'users', 
                'users.blocked', 
                'message', 
                'muted', 
                'banned'
            ]
        })
    }

    removeProtectedProperties(room: Room) {
        room.users?.forEach((user)=> this.userService.removeProtectedProperties(user))
        room.message?.forEach((message) => this.userService.removeProtectedProperties(message.author))
        room.administrator?.forEach((user)=> this.userService.removeProtectedProperties(user))
        room.owner = this.userService.removeProtectedProperties(room.owner)
        room.muted?.forEach((user) => this.userService.removeProtectedProperties(user))
        room.banned?.forEach((user) => this.userService.removeProtectedProperties(user))
        return room
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
            .leftJoinAndSelect('user.blocked', 'blocked')
            .where('room.name = :name', { name: dto.name })
            .orderBy('message.id', 'ASC')
            .getOne();

        const userRelation = await this.userService.findOneByIdWithBlockRelation(user.id)
        if (!room) 
            throw new ForbiddenException('room does not exist')

        if (this.isBanned(room, user))
            throw new ConflictException('Banned user', 
            {cause: new Error(), description: 'you are banned in channel ' + room.name} )

        if (room.password?.length > 0){
            if (! await argon2.verify(room.password, dto.password))
                throw new ForbiddenException('Password invalid')
        }
        if (!room.users)
            room.users = []
        room.users.push(user)
        await this.roomRepository.save(room)
        if (userRelation.blocked && room.message) {
            room.message = room.message.filter(msg => !userRelation.blocked.some(blockedUser => blockedUser.id === msg.author.id));
        } 

        // room.users.forEach((user) => this.userService.removeProtectedProperties(user))
        // room.message.forEach((message) => this.userService.removeProtectedProperties(message.author))
        return room
    }

    async leaveRoom(roomId: number, userId: string){
        const room = await this.findOneByIdWithRelations(roomId)
        if (!room)
            throw new NotFoundException("Room not found", 
            {
                cause: new Error(), 
                description: "cannot find any users in database"
            })
        if (room.users){
            room.users.forEach(user => {
                if (user.id === userId){
                    room.users = room.users.filter(user => user.id !== userId)
                }
            })
            await this.roomRepository.save(room)
        }
        else{
            throw new NotFoundException("No user was found in this room", 
            {
                cause: new Error(), 
                description: `cannot find any users in room ${room?.name} in database`
            })
        }
    }

    async kick(roomId: number, userId: string, targetId: string){
      
        const room = await this.findOneByIdWithRelations(roomId)
        if (!room)
            throw new NotFoundException("Room not found", 
            {
                cause: new Error(), 
                description: "cannot find any users in database"
            })
        const user = await this.userService.findOneById(userId)
        if (!user)
        throw new NotFoundException("User not found", 
        {
            cause: new Error(), 
            description: "cannot find this user in database"
        })
        const user2 = await this.userService.findOneById(targetId)
        if (!user2)
        throw new NotFoundException("User not found", 
        {
            cause: new Error(), 
            description: "cannot find this user in database"
        })
        if (this.isAdmin(room, user) === 'isAdmin' && this.isAdmin(room, user2) === 'isAdmin'){
            throw new ConflictException("User are both admins", 
        {
            cause: new Error(), 
            description: "you cannot kick an admin"
        })}
        if (this.isAdmin(room, user) === 'no'){
            throw new ConflictException("You are not admin", 
        {
            cause: new Error(), 
            description: "you cannot kick if you are not admin"
        })}
        if (this.isAdmin(room, user) === 'isAdmin' && this.isAdmin(room, user2) === 'isOwner'){
            throw new ConflictException("You does not have enough power", 
        {
            cause: new Error(), 
            description: "you cannot kick an owner of channel"
        })} 
        if ((this.isAdmin(room, user) === 'isAdmin' && this.isAdmin(room, user2) === 'no') ||
        (this.isAdmin(room, user) === 'isOwner' && this.isAdmin(room, user2) === 'isAdmin') || 
        (this.isAdmin(room, user) === 'isOwner' && this.isAdmin(room, user2) === 'no'))
        {
            this.leaveRoom(room?.id, user2?.id)
            return [user?.username, user2?.username]
        }
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
        const newRoom = await this.save(room)
        return this.removeProtectedProperties(newRoom)
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
        const newRoom = await this.save(room)
        return this.removeProtectedProperties(newRoom)
    }

    async userPrivileges(updatePrivilegesDto : UpdatePrivilegesDto) {

        const room = await this.findOneByNameWithRelations(updatePrivilegesDto.roomName);
        if (!room)
            throw new NotFoundException("Room not found", {cause: new Error(), description: "cannot find any users in database"})
        if (room.type === roomType.directMessage){
            return "no"
        }
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

    async muteUser(requestMaker : User, updatePrivilegesDto : UpdatePrivilegesDto, timeInMinutes : number) {
        
        const room = await this.findOneByIdWithRelations(updatePrivilegesDto.roomId);
        if (!room)
            throw new NotFoundException("Room not found", 
            {
                cause: new Error(), 
                description: "cannot find any users in database"
            })
        if (!this.isAdmin(room, requestMaker))
            throw new ConflictException('Not an admin', 
            {
                cause: new Error(), 
                description: 'tried to perform actions above your paycheck'
            } )
        const target = await this.userService.findOneById(updatePrivilegesDto.targetId);
        if (!target)
            throw new NotFoundException("User not found", 
            {
                cause: new Error(), 
                description: "cannot find any users in database"
            })
        if (this.isAdmin(room, target) !== 'no')
            throw new ConflictException('Target is admin', 
            {
                cause: new Error(), 
                description: 'You cannot mute an admin'
            } )


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

        const newRoom = this.removeProtectedProperties(await this.save(room))
        return (newRoom);
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

        const newRoom = this.removeProtectedProperties(await this.save(room))
        return (newRoom);
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
            {cause: new Error(), description: target.username + ' is allready banned from ' + room.name});
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

        const newRoom = this.removeProtectedProperties(await this.save(room))
        return (newRoom);
    }

    async unbanUser(requestMaker : User, updatePrivilegesDto : UpdatePrivilegesDto) {

        const room = await this.findOneByIdWithRelations(updatePrivilegesDto.roomId);
        if (!room)
            throw new NotFoundException("Room not found", {cause: new Error(), description: "cannot find any users in database"});
        if (!this.isAdmin(room, requestMaker))
            throw new ConflictException('Not an admin', 
            {cause: new Error(), description: 'tried to perform actions above your paycheck'} )

        const target = await this.userService.findOneById(updatePrivilegesDto.targetId);
        if (!target)
            throw new NotFoundException("User not found", {cause: new Error(), description: "cannot find any users in database"});

        if (!this.isBanned(room, target))
            throw new ConflictException('Not banned', 
            {cause: new Error(), description: target.username + ' is not banned from ' + room.name});
    
        if (!room.banned)    
            room.banned = [];
        room.banned = room.banned.filter((bannedUser) => bannedUser.id != target.id)

        const newRoom = this.removeProtectedProperties(await this.save(room))
        return (newRoom);
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

    async setPassword(user: User, updateRoomDto: UpdateRoomDto){
        const room = await this.findOneByIdWithRelations(updateRoomDto.roomId)
        if (!room)
            throw new NotFoundException("Room not found", 
            {
                cause: new Error(), 
                description: "cannot find this room in database"
            })
        if (room?.owner?.id !== user.id)
            throw new NotFoundException("Not owner", 
            {
                cause: new Error(), 
                description: "you cannot set a password if you are not owner of the channel."
            })
        if (room.password)
            throw new ConflictException("Password already exists", 
            {
                cause: new Error(),
                description: "you cannot set a password when there is already one."
            })
        room.password = await this.authService.hash(updateRoomDto.password)
        this.save(room)
    }

    async changePassword(user: User, updateRoomDto: UpdateRoomDto){
        const room = await this.findOneByIdWithRelations(updateRoomDto.roomId)
        if (!room)
            throw new NotFoundException("Room not found", 
            {
                cause: new Error(), 
                description: "cannot find this room in database"
            })
        if (room?.owner.id !== user.id)
            throw new NotFoundException("Not owner", 
            {
                cause: new Error(), 
                description: "you cannot change password if you are not owner of the channel."
            })
        if (!room.password)
            throw new ConflictException("Password does not exists", 
            {
                cause: new Error(),
                description: "you cannot change a password when there is no password."
            })
        if (await argon2.verify(room.password, updateRoomDto.password)){
            throw new ConflictException("Password is the same", 
            {
                cause: new Error(),
                description: "you cannot change password for the same password."
            })
        }
        room.password = await this.authService.hash(updateRoomDto.password)
        this.save(room)
    }

    async removePassword(user: User, updateRoomDto: UpdateRoomDto){
        const room = await this.findOneByIdWithRelations(updateRoomDto.roomId)
        if (!room)
            throw new NotFoundException("Room not found", 
            {
                cause: new Error(), 
                description: "cannot find this room in database"
            })
        if (room?.owner.id !== user.id)
            throw new NotFoundException("Not owner", 
            {
                cause: new Error(), 
                description: "you cannot remove password if you are not owner of the channel."
            })
        if (!room.password)
            throw new ConflictException("Password does not exists", 
            {
                cause: new Error(),
                description: "You cannot remove a password when there is no password."
            })
        room.password = null
        this.save(room)
    }
}