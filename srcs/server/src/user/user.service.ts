import { Injectable } from '@nestjs/common'

@Injectable()
export class UserService {
	users = [
		{
			id: 1,
			firstName: "Michel",
			lastName: "Platini"
		},
		{
			id: 2,
			firstName: "Michel",
			lastName: "Polnareff"
		},
		{
			id: 3,
			firstName: "Michel",
			lastName: "Houellebecq"
		},
		{
			id: 4,
			firstName: "Michel",
			lastName: "Sarran"
		},
		{
			id: 5,
			firstName: "Michel",
			lastName: "Sardoux"
		}
	]

	findOneById(id: number) {
		return this.users.find((user) => user.id === id) 
	}
}