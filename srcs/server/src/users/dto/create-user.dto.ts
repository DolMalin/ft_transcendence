import { IsNumber } from "class-validator"
export class CreateUserDto {
	@IsNumber()
	ftId: number

}