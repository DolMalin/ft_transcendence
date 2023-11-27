import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { UsersService } from 'src/users/services/users.service';
import { CreateMessageDto } from '../dto/create-message.dto';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message)
        private messageRepo: Repository<Message>
    ){}
    
    async create(messageDto: CreateMessageDto){
        const msg = this.messageRepo.create({
            content: messageDto.content,
            // author: messageDto.author,
        });
    return await this.messageRepo.save(msg)
    }
}
