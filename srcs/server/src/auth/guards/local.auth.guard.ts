
import { Injectable, ExecutionContext, CanActivate, UnauthorizedException} from '@nestjs/common'
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalAuthGuard implements CanActivate {
	constructor(private authService: AuthService) { }
	async canActivate(context: ExecutionContext  ): Promise<any>{
		const req = context.switchToHttp().getRequest()

		const token = await this.authService.getFtToken(req.query.code)
		if (!token)
			throw new UnauthorizedException()

      	const ftId = await this.authService.getFtId(token)
		if (!ftId)
			throw new UnauthorizedException()

		req.user = await this.authService.validateUser(ftId)
		return true
	}
}