import { PartialType } from '@nestjs/mapped-types'
import { CreateUserDto } from './create-user.dto'


export class UpdateUserDto extends PartialType(CreateUserDto) {
	username?: string
	refreshToken?: string
	isRegistered?: boolean
	winsAmount?: number
	loosesAmount?: number
}
