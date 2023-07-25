
import { Injectable, ExecutionContext, CanActivate, UnauthorizedException} from '@nestjs/common'
import { FtAuthService } from '../services/ft.auth.service';

@Injectable()
export class FtAuthGuard implements CanActivate {
	constructor(private ftAuthService: FtAuthService) { }

	async canActivate(context: ExecutionContext  ): Promise<any>{
		const req = context.switchToHttp().getRequest()

		const token = await this.ftAuthService.getFtToken(req.query.code)
		if (!token)
			throw new UnauthorizedException()

      	const ftId = await this.ftAuthService.getFtId(token)
		if (!ftId)
			throw new UnauthorizedException()

		req.user = await this.ftAuthService.validateUser(ftId)
		return true
	}
}