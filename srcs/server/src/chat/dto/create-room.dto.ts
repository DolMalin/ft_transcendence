import { Field } from "@nestjs/graphql";

export class CreateRoomDto {
    
    @Field(() => String, {})
    name: string;

    @Field(() => Boolean, {})
    privChan: boolean

    @Field(() => String, {})
    password: string
}