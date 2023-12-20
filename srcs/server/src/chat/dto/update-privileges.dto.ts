import { IsNumber, IsOptional, IsString, IsUUID, Matches, MaxLength } from "class-validator";
import { TransformFnParams } from 'class-transformer'
import { Transform} from 'class-transformer'
import * as sanitizeHtml from 'sanitize-html'

export class UpdatePrivilegesDto {

    @IsUUID()
    @IsOptional()
    targetId?: string

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @Matches(/^[\w-]+( [\w-]+)*$/, {message: "channel name can only have one space between group of words"})
    @MaxLength(74)
    @IsOptional()
    roomName? : string

    @IsNumber()
    @IsOptional()
    roomId? : number

    @IsNumber()
    @IsOptional()
    timeInMinutes : number
}