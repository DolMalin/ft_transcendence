import { CreateGameDto } from "./create.game.dto";
import { PartialType } from '@nestjs/mapped-types'
import { IsNumber, IsString, IsUUID, MaxLength, MinLength, Matches, IsPositive, IsOptional} from "class-validator";
import { Transform, Type } from 'class-transformer'
import * as sanitizeHtml from 'sanitize-html'
import { TransformFnParams } from 'class-transformer'
export class UpdateGameDto extends PartialType(CreateGameDto){
	
    @IsUUID()
    @IsOptional()
    winnerId : string;

    @IsUUID()
    @IsOptional()
    looserId : string;

	@IsString()
	@MinLength(3)
	@MaxLength(20)
	@Matches(/^[^#<>\[\]|{}\/@:=]*$/, {message: 'username must not contains ^ # < > [ ] | { } : @ or /'})
    @IsOptional()
    winnerUsername : string;

	@IsString()
	@MinLength(3)
	@MaxLength(20)
	@Matches(/^[^#<>\[\]|{}\/@:=]*$/, {message: 'username must not contains ^ # < > [ ] | { } : @ or /'})
    @IsOptional()
    looserUsername : string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    winnerScore : number;
    
    @IsNumber()
    @IsPositive()
    @IsOptional()
    looserScore : number;
}