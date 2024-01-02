import { IsInt, IsNumber, IsOptional, IsUUID } from "class-validator";

export class UpdatePrivilegesDto {

    @IsUUID()
    targetId: string

    @IsInt()
    @IsNumber()//a remplacer imo
    roomId : number
    
    @IsInt()
    @IsNumber()//a remplacer imo
    @IsOptional()
    timeInMinutes : number
}