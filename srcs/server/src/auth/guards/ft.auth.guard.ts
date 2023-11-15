
import { Injectable, ExecutionContext, CanActivate, UnauthorizedException, InternalServerErrorException} from '@nestjs/common'
import { AuthService } from '../services/auth.service';

@Injectable()
export class FtAuthGuard implements CanActivate {
	constructor(private authService: AuthService) { }

	async canActivate(context: ExecutionContext  ): Promise<any>{
		const req = context.switchToHttp().getRequest()
		const code = req.query.code

		if (!code?.length)
			return false
		const token = await this.authService.getFtToken(code)
		if (!token)
			throw new UnauthorizedException()
			
		const ftId = await this.authService.getFtId(token)
		if (!ftId)
			throw new UnauthorizedException()

		req.user = await this.authService.validateUser(ftId)
		if (!req.user)
			throw new InternalServerErrorException()
		return true
	}
}
