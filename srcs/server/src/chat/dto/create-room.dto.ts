import { Field } from "@nestjs/graphql";

export class CreateRoomDto {
    
    @Field(() => String, {})
    name: string;

    @Field(() => String, {})
    password: string
}