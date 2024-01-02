import { IsInt, IsNumber, IsOptional, IsUUID, Max } from "class-validator";

export class UpdatePrivilegesDto {

    @IsUUID()
    @IsOptional()
    targetId: string

    @IsInt()
    @IsNumber()
    @IsOptional()
    @Max(1000000)
    roomId? : number
    
    @IsInt()
    @IsNumber()
    @IsOptional()
    @Max(120)
    timeInMinutes : number
}