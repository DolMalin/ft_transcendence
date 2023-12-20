import { Transform, TransformFnParams } from 'class-transformer'
import { IsInt, IsNumber, IsOptional, IsString, MinLength, MaxLength } from 'class-validator'
import * as sanitizeHtml from 'sanitize-html'

export class UpdateRoomDto{
    
    @IsInt()
    @IsOptional()
    roomId? : number

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @MinLength(6)
    @MaxLength(20)
    @IsOptional()
    password?: string
}
