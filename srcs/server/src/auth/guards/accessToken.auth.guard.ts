import { Injectable,} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt'){
	handleRequest(err: any, user: any, info: any, context: any, status: any) {
		if (!user || err) {
			throw new UnauthorizedException('Access denied', {cause: new Error(), description: `invalid token`})
		}
	
		return super.handleRequest(err, user, info, context, status);
	  }	
}