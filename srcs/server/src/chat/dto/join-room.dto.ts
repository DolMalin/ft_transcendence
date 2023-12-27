import { Field } from "@nestjs/graphql";
import { IsOptional, IsString, MaxLength, MinLength} from "class-validator";
import { TransformFnParams, Type } from 'class-transformer'
import { Transform} from 'class-transformer'
import * as sanitizeHtml from 'sanitize-html'
import { IsOptionalWithEmptyStrings } from "../decorators/isOptionnalWithEmptyStrings.decorator";

export class JoinRoomDto {
    
    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @MaxLength(74)
    name: string

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @MinLength(6)
    @MaxLength(20)
    @IsOptionalWithEmptyStrings()
    password: string | null
}