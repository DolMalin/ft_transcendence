import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import { HttpException, HttpStatus} from '@nestjs/common'
import { leaderboardStats } from 'src/game/interfaces/interfaces';


@Injectable()
export class UsersService {
  constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>
	) { }

  async create(createUserDto: CreateUserDto) {
    
		const newUser = this.userRepository.create(createUserDto)
		return await this.userRepository.save(newUser)
  }

  findAll() {
    return this.userRepository.find();
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

  async returnScoreList(){
    return (this.findAll().then((res : User[]) => {
        let scoreList : leaderboardStats[] = []; 
        res.forEach((value) => {
        scoreList.push({username : value.id, winsAmount : value.winsAmount, loosesAmount : value.loosesAmount});
      })
      return (scoreList);
    }));
  }
}
