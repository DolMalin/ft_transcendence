import { PartialType } from '@nestjs/mapped-types'
import { CreateRoomDto } from './create-room.dto'
import { Field } from '@nestjs/graphql'


export class UpdateRoomDto extends PartialType(CreateRoomDto) {
    
}
