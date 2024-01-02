import { IsInt, IsNumber, IsOptional, IsUUID } from "class-validator";

export class UpdatePrivilegesDto {

    @IsUUID()
    @IsOptional()
    targetId: string

    @IsInt()
    @IsNumber()//a remplacer imo
    @IsOptional()
    roomId : number
    
    @IsInt()
    @IsNumber()//a remplacer imo
    @IsOptional()
    timeInMinutes : number
}