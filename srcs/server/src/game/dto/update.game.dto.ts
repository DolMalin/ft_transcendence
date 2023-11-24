import { IsNumber, IsOptional, IsString } from "class-validator";
import { CreateGameDto } from "./create.game.dto";
import { PartialType } from '@nestjs/mapped-types'

export class UpdateGameDto extends PartialType(CreateGameDto){
	
    @IsString()
    @IsOptional()
    winnerId : string;

    @IsString()
    @IsOptional()
    winnerUsername : string;

    @IsNumber()
    @IsOptional()
    winnerScore : number;
    
    @IsString()
    @IsOptional()
    looserId : string;

    @IsString()
    @IsOptional()
    looserUsername : string;


    @IsNumber()
    @IsOptional()
    looserScore : number;
}