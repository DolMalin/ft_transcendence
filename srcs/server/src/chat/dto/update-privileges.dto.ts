import { IsInt, IsNumber, IsOptional, IsString, IsUUID, Matches, MaxLength } from "class-validator";
import { TransformFnParams } from 'class-transformer'
import { Transform} from 'class-transformer'
import * as sanitizeHtml from 'sanitize-html'

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
    @IsNumber()//a remplacer imo
    @IsOptional()
    roomId? : number
    
    @IsInt()
    @IsNumber()//a remplacer imo
    @IsOptional()
    timeInMinutes : number
}