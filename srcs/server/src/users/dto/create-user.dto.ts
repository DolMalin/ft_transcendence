import { Field } from "@nestjs/graphql";

export class CreateUserDto {
	@Field(() => String)
	ftId: number

}