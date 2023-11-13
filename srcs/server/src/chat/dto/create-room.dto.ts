import { Field } from "@nestjs/graphql";

export class CreateRoomDto {
    @Field(() => String)
    roomName: String;
}