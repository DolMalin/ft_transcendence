import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class BrowserCheckMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.headers['user-agent'];

    if (!userAgent.includes('Mozilla') && !userAgent.includes('Chrome')) {
		throw new BadRequestException("Request blocked", {cause: new Error(), description: "request must come from a browser"})
    }

    next();
  }
}