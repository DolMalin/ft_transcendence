import { Field } from "@nestjs/graphql";
import { User } from "src/users/entities/user.entity";
import { ManyToOne } from "typeorm";
import { Room } from "../entities/room.entity";

export class CreateMessageDto {
    id: number

    @Field(() => String, {})
    content : String;

    @Field(() => String, {})
    author : User

	send_at: Date;
    
}