import { PartialType } from '@nestjs/mapped-types'
import { CreateMessageListDto } from './create-message-list.dto'
import { Field } from '@nestjs/graphql'


export class UpdateMessageListDto extends PartialType(CreateMessageListDto) {
    
}
