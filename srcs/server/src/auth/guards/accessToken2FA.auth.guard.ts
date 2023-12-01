import { Injectable,} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AccessToken2FAGuard extends AuthGuard('jwt-2fa'){
	
}