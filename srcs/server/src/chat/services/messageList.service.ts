import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { CreateMessageListDto } from '../dto/create-message-list.dto';
import { UpdateMessageListDto } from '../dto/update-message-list.dto';
import { Repository, DeepPartial } from 'typeorm'
import { HttpException, HttpStatus} from '@nestjs/common'
import { Message } from '../entities/message-list.entity';

@Injectable()
export class MessageListService {
    constructor(
        @InjectRepository(MessageListService)
        private messageRepository: Repository<Message>
    ) {}

    async create(createMessageListDto: DeepPartial<Message>[]): Promise<Message[]>{
        const newMessage = this.messageRepository.create(createMessageListDto)
        return await this.messageRepository.save(newMessage)
    }

    findAll() {
        return this.messageRepository.find();
    }

    findOneById(id: number){
        return this.messageRepository.findOneBy({id})
    }

    async update(id: number, updateMessageDto: DeepPartial<Message>): Promise<Message> {
        await this.messageRepository.update(id, updateMessageDto)
        const newMessage = await this.findOneById(id)
        if (newMessage)
          return newMessage
        throw new HttpException('Message not found', HttpStatus.NOT_FOUND)
    }
    
    async remove(id: number) {
        const Message = await this.findOneById(id)
        return this.messageRepository.remove(Message)
    }
    
}