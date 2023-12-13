import { IsNumber, IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator";
import { TransformFnParams } from 'class-transformer'
import { Transform} from 'class-transformer'
import * as sanitizeHtml from 'sanitize-html'

export class CreateMessageDto {

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @MinLength(1)
    @Matches(/^(?!\s*$).+/, {message: "message must not contains only spaces"})
	@MaxLength(1000)
    content : string;

    @IsNumber()
    roomId : number;

    @IsString()
	@Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    authorName: string

    @IsUUID()
    authorId: string
    
}