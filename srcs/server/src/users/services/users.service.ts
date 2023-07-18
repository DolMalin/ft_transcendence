import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import { HttpException, HttpStatus} from '@nestjs/common'

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

  findOne(ftId: number) {
    return this.userRepository.findOneBy({ ftId })
  } 

  async update(ftId: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(ftId)
    return this.userRepository.save({...user, ...updateUserDto})
  }

  async remove(ftId: number) {
    const user = await this.findOne(ftId)
    return this.userRepository.remove(user)
  }
}
