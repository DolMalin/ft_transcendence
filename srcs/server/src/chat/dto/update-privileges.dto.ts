import { IsInt, IsNumber, IsOptional, IsString, IsUUID, Matches, Max, MaxLength } from "class-validator";

export class UpdatePrivilegesDto {

    @IsUUID()
    targetId: string

    @IsInt()
    @IsNumber()
    @Max(1000000)
    roomId : number
    
    @IsInt()
    @IsNumber()
    @IsOptional()
    @Max(120)
    timeInMinutes : number
}