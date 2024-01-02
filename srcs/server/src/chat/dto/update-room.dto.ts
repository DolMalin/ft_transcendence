import { IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class UpdateRoomDto{
    
    @IsInt()
    @IsOptional()
    roomId? : number

    @IsString()
    @MinLength(6)
    @MaxLength(20)
    @IsOptional()
    password?: string
}
