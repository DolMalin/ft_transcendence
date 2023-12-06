import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import { HttpException, HttpStatus} from '@nestjs/common'
import { AvatarService } from './avatar.service';
import { GameState, leaderboardStats } from 'src/game/globals/interfaces';
import { CreateGameDto } from 'src/game/dto/create.game.dto';
import { Game } from 'src/game/entities/game-entity';
import { UpdateGameDto } from 'src/game/dto/update.game.dto';
import { Avatar } from '../entities/avatar.entity';

@Injectable()
export class UsersService {
  constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,

    private readonly avatarService: AvatarService,
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

    if (!user)
      throw new NotFoundException('User not found', {cause: new Error(), description: 'The user do not exist in database'})

    const avatar = await this.avatarService.getAvatarById(user.avatarId)

    if (!avatar)
      throw new NotFoundException('Avatar not found', {cause: new Error(), description: 'The avatar do not exist in database (probably not setup yet)'})
    
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

    addChatSocketId(socketId : string, socketIdArray : string[], user : User) {

      if (socketIdArray === null || socketIdArray === undefined)
        socketIdArray = [];
      socketIdArray?.push(socketId);
      user.chatSockets = socketIdArray;
      return (this.update(user.id, {chatSockets : user.chatSockets}))
    }
    
  /**
 * @description return an array of objects containing {username, userId,winsAmount, loosesAmount, W/L Ratio} of all users
 */ 
  returnScoreList(){

    function winRatioCalculator(w : number, l : number) {
        
      if (l === 0 && w === 0)
          return (0);
      if (l === 0)
          return (100);

      let ratio = w * 100 / (w + l);

      return (ratio)
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
