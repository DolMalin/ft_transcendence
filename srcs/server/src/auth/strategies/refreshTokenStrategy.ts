import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt"
import { Injectable, Req} from "@nestjs/common";


@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refres') {
	constructor() {
		super({
			jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.JWT_REFRESH_SECRET,
			passReqToCallback:true
		})
	}

	async validate(@Req() req: any, payload: any) {
		const refreshToken = req.get('Authorization').replace('Bearer', '').trim()
		return { ...payload, refreshToken }
	}
}