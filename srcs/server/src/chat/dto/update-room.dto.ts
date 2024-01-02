import { IsInt, IsOptional, IsString, Max, MaxLength, MinLength } from 'class-validator'

export class UpdateRoomDto{
    
    @IsInt()
    @IsOptional()
    @Max(100000)
    roomId? : number

    @IsString()
    @MinLength(6)
    @MaxLength(20)
    @IsOptional()
    password?: string
}
