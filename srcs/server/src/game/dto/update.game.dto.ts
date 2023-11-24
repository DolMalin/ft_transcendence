import { IsNumber, IsOptional, IsString } from "class-validator";
import { CreateGameDto } from "./create.game.dto";
import { PartialType } from '@nestjs/mapped-types'

export class UpdateGameDto extends PartialType(CreateGameDto){
	
    @IsString()
    @IsOptional()
    date : string;

    @IsString()
    @IsOptional()
    winnerId : string;

    @IsString()
    @IsOptional()
    winnerUsername : string;

    @IsString()
    @IsOptional()
    looserId : string;

    @IsString()
    @IsOptional()
    looserUsername : string;

    @IsNumber()
    @IsOptional()
    winnerScore : number;

    @IsNumber()
    @IsOptional()
    looserScore : number;
}