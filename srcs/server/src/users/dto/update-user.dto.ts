import { PartialType } from '@nestjs/mapped-types'
import { CreateUserDto } from './create-user.dto'
import { Game } from 'src/game/entities/game-entity'
import { IsString, IsJWT, IsBoolean, IsInt, IsPositive, IsArray, IsOptional, MinLength, MaxLength, NotContains, Matches} from 'class-validator'
import { Transform, Type } from 'class-transformer'
import * as sanitizeHtml from 'sanitize-html'
import { TransformFnParams } from 'class-transformer'

export class UpdateUserDto extends PartialType(CreateUserDto) {
	@IsString()
	@Transform((params: TransformFnParams) => sanitizeHtml(params.value))
	@MinLength(3)
	@MaxLength(20)
	@Matches(/^[^#<>\[\]|{}\/@:=]*$/, {message: 'username must not contains ^ # < > [ ] | { } / @ or :'})
	@IsOptional()
	username?: string

	@IsJWT()
	@IsOptional()
	refreshToken?: string

	@IsBoolean()
	@IsOptional()
	isRegistered?: boolean

	@IsOptional()
	twoFactorAuthenticationSecret?: string

	@IsBoolean()
	@IsOptional()
	isTwoFactorAuthenticationEnabled?: boolean

	@IsBoolean()
	@IsOptional()
	isTwoFactorAuthenticated?: boolean

	@IsInt()
	@IsPositive()
	@IsOptional()
	winsAmount?: number

	@IsInt()
	@IsPositive()
	@IsOptional()
	loosesAmount?: number

	@IsBoolean()
	@IsOptional()
	isAvailable?: boolean

	@IsArray()
	@Type(() => String)
	@IsOptional()
	gameSockets?: string[]

	@IsArray()
	@Type(() => String)
	@IsOptional()
	chatSockets?: string[]

	@IsArray()
	@Type(() => Game)
	@IsOptional()
	playedGames?: Game[]
	
}
