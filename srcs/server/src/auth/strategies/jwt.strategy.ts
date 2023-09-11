import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt"
import { Injectable } from "@nestjs/common";


function cookieExtractor(req: any) : string {
	try {
		if (req.cookies["jwt"]) {
			return req.cookies["jwt"]
		}
	} catch {
	}
	return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET
		})
	}

	async validate(payload: any) {
		return { jwt: payload.jwt }
	}
}