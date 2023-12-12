import { ForbiddenException, Injectable,} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshToken2FAGuard extends AuthGuard('jwt-refresh-2fa') {
	handleRequest(err: any, user: any, info: any, context: any, status: any) {
		if (!user) {
			throw new ForbiddenException('Access denied', {cause: new Error(), description: `Invalid token`})
		}
	
		return super.handleRequest(err, user, info, context, status);
	  }	
}