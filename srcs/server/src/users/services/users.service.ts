import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import { AvatarService } from './avatar.service';
import { GameState, leaderboardStats } from 'src/game/globals/interfaces';
import { isUUID } from 'class-validator';
import { Readable } from 'stream';

import { Server} from 'socket.io';

import { GameGateway } from 'src/game/gateway/game.gateway';
@Injectable()
export class UsersService {
  constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,

    private readonly avatarService: AvatarService,
	) { }

  async create(createUserDto: CreateUserDto) {
    
		const newUser = this.userRepository.create(createUserDto)
    if (!newUser)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'cannot update user'})

		const user = await this.userRepository.save(newUser)
    if (!user)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'cannot update user'})
    
    return user
  }


  findAll() {
    return this.userRepository.find({relations :{playedGames: true}});
  }

  findOneById(id: string) {
    return this.userRepository.findOneBy({ id })
  }

  findOneByFtId(ftId: number) {
    return this.userRepository.findOneBy({ ftId })
  }

  findOneWitOptions(options: any) {
    return this.userRepository.findOne(options)
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const result = await this.userRepository.update(id, updateUserDto)
    if (!result)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'cannot update user'})

    const user = await this.findOneById(id)
    return user
  }

  async save(user: User) {
    const newUser = await this.userRepository.save(user)
    if (!newUser)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'cannot update user'}) 
    return newUser

  }

  
  async addAvatar(id: string, dataBuffer: Buffer, filename: string) {
    const avatar = await this.avatarService.create(dataBuffer, filename)
    if (!avatar)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'cannot create avatar'})

    await this.userRepository.update(id, {
      avatarId: avatar.id
    })
    return avatar
  }

  async getAvatar(id: string) {
    
    const user = await this.userRepository.findOneBy({id})

    if (!user)
      throw new NotFoundException('User not found', {cause: new Error(), description: 'the user do not exist in database'})

    const avatar = await this.avatarService.getAvatarById(user.avatarId)

    if (!avatar)
      throw new NotFoundException('Avatar not found', {cause: new Error(), description: 'the avatar do not exist in database (probably not setup yet)'})
    
    return avatar
  }

  async getUserAvatar( res: any, id: string) {

    if(id && !isUUID(id))
      throw new BadRequestException('Invalid id', {cause: new Error(), description: `ID '${id}' is not an UUID`})

    try {
      const avatar = await this.getAvatar(id)
      const stream = Readable.from(avatar?.data)
      
      res.set({
        'Content-Disposition':`inline; filename="${avatar?.filename}"`,
        'Content-Type' :'image'
      })
  
      return new StreamableFile(stream)
    }
    catch (e) {
      throw e
    }
  }


  async remove(id: string) {
    const user = await this.findOneById(id)
    return this.userRepository.remove(user)
  }

  async removeAll() {
    const users = this.findAll();
    (await users).forEach((value) => {
      this.userRepository.remove(value);
    });
  }

  /**
 * @description remove a socket Id from an array of string stored in user entity and update the user
 */
  async removeSocketId(socketId : string, socketIdArray : string[], user : User) {
    user.gameSockets = socketIdArray?.filter((value) => value != socketId)
    console.log("ICI")
    const updatedUser = await this.update(user.id, { gameSockets : user.gameSockets})
    if (!updatedUser)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'cannot update user'})
    console.log("et donc la")
    return updatedUser
  }


  addGameSocketId(socketId : string, socketIdArray : string[], user : User) {

      if (socketIdArray === null || socketIdArray === undefined)
        socketIdArray = [];
      socketIdArray?.push(socketId);
      user.gameSockets = socketIdArray;
      return (this.update(user.id, {gameSockets : user.gameSockets}));
    }
    
  /**
  * @description add a socket Id to an array of string stored in user entity and update the user
  */
   addChatSocketId(socketId : string, socketIdArray : string[], user : User) {
 
     if (socketIdArray === null || socketIdArray === undefined)
       socketIdArray = [];
     socketIdArray?.push(socketId);
     user.chatSockets = socketIdArray;
     return (this.update(user.id, {chatSockets : user.chatSockets}));
   }

   async emitToAllSockets(server : Server, socketIdArray : string[], eventName : string, payload : Object) {

    socketIdArray.forEach((socketId) => {
      if (payload === undefined) 
        server.to(socketId).emit(eventName);
      else
        server.to(socketId).emit(eventName, payload);
    });
   }

  // }

  /**
 * @description return an array of objects containing {username, userId,winsAmount, loosesAmount, W/L Ratio} of all users
 */ 
  returnScoreList(){

    function winRatioCalculator(w : number, l : number) {
        
      if (l === 0 && w === 0)
          return (0);
      if (l === 0)
          return (100);

      const ratio = w * 100 / (w + l);
      
      return (Math.trunc(ratio))
    }

    
    // TODO
    return (this.findAll().then((res : User[]) => {
      let scoreList : leaderboardStats[] = []; 

      res?.forEach(async (value) => {

        scoreList.push({username : value.username, id : value.id,winsAmount : value.winsAmount, loosesAmount : value.loosesAmount,
        WLRatio : winRatioCalculator(value.winsAmount, value.loosesAmount)});
      })
      return (scoreList);
    }));
  }

  async returnProfile(userId : string) {
    try {
      const user = await this.findOneById(userId);
      if (user === undefined)
        throw new NotFoundException("Users not found", {cause: new Error(), description: "cannot find any users in database"})
      return ({username : user.username, id : user.id, winsAmount : user.winsAmount, loosesAmount : user.loosesAmount})
    }
    catch (err) {
      throw new NotFoundException("Users not found", {cause: new Error(), description: "cannot find any users in database"})
    }
  }
}
