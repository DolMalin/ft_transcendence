import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional, IsPositive, IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator";
import { CreateGameDto } from "./create.game.dto";
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