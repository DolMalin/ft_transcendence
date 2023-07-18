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

  create(createUserDto: CreateUserDto) {
		const newUser = this.userRepository.create(createUserDto)
		return this.userRepository.save(newUser)
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: string) {
    return this.userRepository.findOneBy({ id })
  } 

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = this.findOne(id)
    return this.userRepository.save({...user, ...updateUserDto})
  }

  async remove(id: string) {
    const user = await this.findOne(id)
    return this.userRepository.remove(user)
  }
}
