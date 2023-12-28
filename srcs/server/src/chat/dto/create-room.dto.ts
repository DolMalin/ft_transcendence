import { Field } from "@nestjs/graphql";
import { User } from "src/users/entities/user.entity";
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { TransformFnParams, Type } from 'class-transformer'
import { Transform} from 'class-transformer'
import * as sanitizeHtml from 'sanitize-html'

export class CreateRoomDto {
    
    @IsString()
    @Matches(/^\w+( \w+)*$/, {message: "channel name can only have one space between group of words"})
    @Matches(/^[^#<>\[\]|{}\/@:=]*$/, {message: 'channel name must not contains ^ # < > [ ] | { } : @ or /'})
    @MaxLength(74)
    name: string
    
    @IsBoolean()
    privChan: boolean
    
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    @IsOptional()
    password: string

    @Type(() => User)
    owner: User

    @IsArray()
	@Type(() => User)
    @IsOptional()
    administrator: User[]
}