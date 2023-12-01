import { Field } from "@nestjs/graphql";
import { User } from "src/users/entities/user.entity";

export class CreateRoomDto {
    
    name: string
    
    privChan: boolean

    password: string

    owner: User

    administrator: User[]
}