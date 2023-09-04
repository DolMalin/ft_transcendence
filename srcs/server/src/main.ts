import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: true});
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.use(cookieParser())
  await app.listen(process.env.PORT);
}
bootstrap();
