import { IsString, Matches, MaxLength, MinLength } from "class-validator";
import { IsOptionalWithEmptyStrings } from "../decorators/isOptionnalWithEmptyStrings.decorator";

export class JoinRoomDto {
    
    @MaxLength(74)
    @IsString()
    @Matches(/^\w+( \w+)*$/, {message: "channel name can only have one space between group of words"})
    @Matches(/^[^#<>\[\]|{}\/@:=]*$/, {message: 'channel name must not contains ^ # < > [ ] | { } : @ or /'})
    @MaxLength(74)
    name: string

    @IsString()
    @MinLength(6)
    @MaxLength(20)
    @IsOptionalWithEmptyStrings()
    password: string | null
}