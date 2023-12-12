import { IsNumber, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { TransformFnParams } from 'class-transformer'
import { Transform} from 'class-transformer'
import * as sanitizeHtml from 'sanitize-html'

export class CreateMessageDto {

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    content : string;

    @IsNumber()
    roomId : number;

    @IsString()
	@Transform((params: TransformFnParams) => sanitizeHtml(params.value))
	@MaxLength(1000)
    authorName: string

    @IsNumber()
    authorId: number

    @IsString()
	sendAt: string;
    
}