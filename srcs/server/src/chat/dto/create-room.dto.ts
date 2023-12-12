import { Field } from "@nestjs/graphql";
import { User } from "src/users/entities/user.entity";
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { TransformFnParams, Type } from 'class-transformer'
import { Transform} from 'class-transformer'
import * as sanitizeHtml from 'sanitize-html'

export class CreateRoomDto {
    
    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @MaxLength(20)
    name: string
    
    @IsBoolean()
    privChan: boolean
    
    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsOptional()
    @MinLength(6)
    @MaxLength(20)
    password: string

    @Type(() => User)
    owner: User

    @IsArray()
	@Type(() => User)
    @IsOptional()
    administrator: User[]
}