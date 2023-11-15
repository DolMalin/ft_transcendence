import { Field } from "@nestjs/graphql";

export class CreateMessageDto {
    @Field(() => String, {})
    name : String;

    @Field(() => String, {})
    author : string

	send_at: Date;
}