import { PartialType } from '@nestjs/mapped-types'
import { CreateUserDto } from './create-user.dto'


export class UpdateUserDto extends PartialType(CreateUserDto) {
	username?: string
	refreshToken?: string
	isRegistered?: boolean
	twoFactorAuthenticationSecret?: string
	isTwoFactorAuthenticationEnabled?: boolean
	isTwoFactorAuthenticated?: boolean
	winsAmount?: number
	loosesAmount?: number
	isAvailable?: boolean
	gameSockets?: string[]
}
