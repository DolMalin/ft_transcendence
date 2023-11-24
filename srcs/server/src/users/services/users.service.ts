import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import { HttpException, HttpStatus} from '@nestjs/common'
import { AvatarService } from './avatar.service';
import { leaderboardStats } from 'src/game/globals/interfaces';
import { CreateGameDto } from 'src/game/dto/create.game.dto';
import { Game } from 'src/game/entities/game-entity';

@Injectable()
export class UsersService {
  constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
    private readonly avatarService: AvatarService
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

  async addGameToWinnerPlayedGames(game : Game) {

    const winner = await this.userRepository.findOne({relations : {playedGames: true},where: {id : game.winnerId }});
    // console.log('id : ', winner.id, 'winner : ', winner)
    if (winner.playedGames === undefined)
      winner.playedGames = [];
    winner.playedGames.push(game);
    winner.winsAmount ++;
    this.userRepository.save(winner);

  }

  async addGameToLooserPlayedGames(game : Game)
  {
    const looser = await this.userRepository.findOne({relations : {playedGames: true},where: {id : game.winnerId }});
    if (looser.playedGames === undefined)
    looser.playedGames = [];
  looser.playedGames.push(game);
  // console.log('played games : ', looser.playedGames)
  // console.log('id : ', looser.id, 'looser : ', looser)
  looser.loosesAmount ++;
    this.userRepository.save(looser);
  }

  async returnScoreList(){

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
        res.forEach((value) => {
        scoreList.push({username : value.id, winsAmount : value.winsAmount, loosesAmount : value.loosesAmount,
        WLRatio : winRatioCalculator(value.winsAmount, value.loosesAmount)});
      })
      return (scoreList);
    }));
  }
}
