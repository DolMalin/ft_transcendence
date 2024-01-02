import { IsInt, IsNumber, IsOptional, IsString, IsUUID, Matches, Max, MaxLength } from "class-validator";

export class UpdatePrivilegesDto {

    @IsUUID()
    @IsOptional()
    targetId?: string

    @MaxLength(74)
    @IsString()
    @Matches(/^\w+( \w+)*$/, {message: "channel name can only have one space between group of words"})
    @Matches(/^[^#<>\[\]|{}\/@:=]*$/, {message: 'channel name must not contains ^ # < > [ ] | { } : @ or /'})
    @MaxLength(74)
    @IsOptional()
    roomName? : string

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