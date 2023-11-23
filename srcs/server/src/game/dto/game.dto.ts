import { Field } from "@nestjs/graphql";
import { User } from "src/users/entities/user.entity";

export class CreateGameDto {
	
    @Field(() => String)
	id: string;

    @Field(() => String)
    date : string;

    @Field(() => String)
    winnerId : string;

    @Field(() => String)
    looserId : string;

    @Field(() => Number)
    winnerScore : number;

    @Field(() => Number)
    looserScore : number;

    // TO ASK : does this really work ?
    @Field(() => User)
    players : User[];
}