import { PartialType } from '@nestjs/mapped-types'
import { CreateUserDto } from './create-user.dto'
import { Game } from 'src/game/entities/game-entity'


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
	chatSockets?: string[]
	playedGames?: Game[]
	
}
