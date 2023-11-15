import { PartialType } from '@nestjs/mapped-types'
import { CreateUserDto } from './create-user.dto'
import { Field } from '@nestjs/graphql'


export class UpdateUserDto extends PartialType(CreateUserDto) {
	username?: string
	refreshToken?: string
	isRegistered?: boolean
}
