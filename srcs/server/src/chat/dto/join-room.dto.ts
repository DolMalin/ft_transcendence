import { Field } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

export class JoinRoomDto {
    
    @IsString()
    name: string

    @IsString()
    @IsOptional()
    password: string | null
}