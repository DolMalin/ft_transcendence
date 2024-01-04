import { IsInt, IsNumber, IsOptional, IsPositive, IsUUID, Max } from "class-validator";

export class UpdatePrivilegesDto {

    @IsUUID()
    targetId: string

    @IsInt()
    @IsPositive()
    @IsNumber()
    @Max(2147483647)
    roomId : number
    
    @IsInt()
    @IsNumber()
    @IsPositive()
    @IsOptional()
    @Max(120)
    timeInMinutes : number
}