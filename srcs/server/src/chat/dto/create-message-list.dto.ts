import { Field } from "@nestjs/graphql";

export class CreateMessageListDto {
    @Field(() => String)
    message: String;
}