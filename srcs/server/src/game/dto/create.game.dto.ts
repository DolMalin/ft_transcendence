import { IsNumber, IsString } from "class-validator";

export class CreateGameDto {
	
    @IsString()
    date : string;

    @IsString()
    winnerId : string;

    @IsString()
    winnerUsername : string;

    @IsString()
    looserId : string;

    @IsString()
    looserUsername : string;

    @IsNumber()
    winnerScore : number;

    @IsNumber()
    looserScore : number;
}