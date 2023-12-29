import { IsNumber, IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator";
import { Escape } from "class-sanitizer"
import { Transform, TransformFnParams } from "class-transformer";
import * as sanitizeHtml from 'sanitize-html';
import * as xss from "xss"

export class CreateMessageDto {

    @IsString()
    @MinLength(1)
    @Matches(/^(?!\s*$).+/, {message: "message must not contains only spaces"})
	@MaxLength(1000)
    content : string;

    @IsNumber()
    roomId : number;

	@IsString()
	@MinLength(3)
	@MaxLength(20)
	@Matches(/^[^#<>\[\]|{}\/@:=]*$/, {message: 'username must not contains ^ # < > [ ] | { } : @ or /'})
    authorName: string

    @IsUUID()
    authorId: string
    
}

