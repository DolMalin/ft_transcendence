import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt"
import { Injectable, Req} from "@nestjs/common";

const cookieExtractor = req => {
    let jwt = null 

    if (req && req.cookies) {
        jwt = req.cookies['jwt']
    }

    return jwt
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
	constructor() {
		super({
			jwtFromRequest:ExtractJwt.fromExtractors([
				RefreshTokenStrategy.extractJWT
			  ]),
			secretOrKey: process.env.JWT_REFRESH_SECRET,
		})
	}

	private static extractJWT(req: any): string | null {
		if (
		  req.cookies &&
		  'refreshToken' in req.cookies &&
		  req.cookies.refreshToken?.length > 0
		) {
		  return req.cookies.refreshToken;
		}
		return null;
	  }

	async validate(@Req() req: any, payload: any) {
		return {payload}
	}
}