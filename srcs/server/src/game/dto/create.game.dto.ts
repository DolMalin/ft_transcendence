import { IsNumber, IsString, IsUUID, MaxLength, MinLength, Matches, IsPositive} from "class-validator";
import { Transform, Type } from 'class-transformer'
import * as sanitizeHtml from 'sanitize-html'
import { TransformFnParams } from 'class-transformer'
export class CreateGameDto {
	
    @IsUUID()
    winnerId : string;
    
    @IsString()
    @IsUUID()
    looserId : string;

	@IsString()
	@MinLength(3)
	@MaxLength(20)
	@Matches(/^[^#<>\[\]|{}\/@:=]*$/, {message: 'username must not contains ^ # < > [ ] | { } : @ or /'})
    winnerUsername : string;

	@IsString()
	@MinLength(3)
	@MaxLength(20)
	@Matches(/^[^#<>\[\]|{}\/@:=]*$/, {message: 'username must not contains ^ # < > [ ] | { } : @ or /'})
    looserUsername : string;

    @IsNumber()
    @IsPositive()
    winnerScore : number;

    @IsNumber()
    @IsPositive()
    looserScore : number;
}