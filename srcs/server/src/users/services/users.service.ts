import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import { HttpException, HttpStatus} from '@nestjs/common'
import { AvatarService } from './avatar.service';
import { leaderboardStats } from 'src/game/globals/interfaces';
import { Server} from 'socket.io';

import { GameGateway } from 'src/game/gateway/game.gateway';
@Injectable()
export class UsersService {
  constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,

    private readonly avatarService: AvatarService,
    // private readonly gameGateway: GameGateway,
	) { }

  async create(createUserDto: CreateUserDto) {
    
		const newUser = this.userRepository.create(createUserDto)
		return await this.userRepository.save(newUser)
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

  async update(id: string, updateUserDto: UpdateUserDto) {

    await this.userRepository.update(id, updateUserDto)
    const newUser = await this.findOneById(id)
    if (newUser)
      return newUser
    throw new HttpException('User not found', HttpStatus.NOT_FOUND)
  }

  async addAvatar(id: string, dataBuffer: Buffer, filename: string) {
    const avatar = await this.avatarService.create(dataBuffer, filename)
    await this.userRepository.update(id, {
      avatarId: avatar.id
    })
    return avatar
  }

  async getAvatar(id: string) {
    const user = await this.userRepository.findOneBy({id})
    if (user.avatarId == null)
      throw new HttpException('No avatar found', HttpStatus.NOT_FOUND)
    const avatar = await this.avatarService.getAvatarById(user.avatarId)
    return avatar
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
  removeSocketId(socketId : string, socketIdArray : string[], user : User) {

    user.gameSockets = socketIdArray?.filter((value) => value != socketId)
    return (this.update(user.id, { gameSockets : user.gameSockets}))
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

    
    return (this.findAll().then((res : User[]) => {
      let scoreList : leaderboardStats[] = []; 

      res?.forEach(async (value) => {

        scoreList.push({username : value.username, id : value.id,winsAmount : value.winsAmount, loosesAmount : value.loosesAmount,
        WLRatio : winRatioCalculator(value.winsAmount, value.loosesAmount)});
      })
      return (scoreList);
    }));
  }
}
