
import { Controller, Get, Req, Res, Param, ParseIntPipe} from '@nestjs/common'
import { Request, Response } from 'express'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
	constructor(private userService: UserService) {}
	@Get(':id')
	getCustomer(
		@Param('id', ParseIntPipe) id: number,
		@Req() req: Request, 
		@Res() res: Response
	) {
		const user = this.userService.findOneById(id);
		if (user) {
			res.send(user)
		} else {
			res.status(400).send({msg: "user not found"})
		}
	}
}