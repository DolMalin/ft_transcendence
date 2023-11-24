import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {bodyParser:true})

  app.use(cookieParser())


  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
        allowedHeaders: [
      "Accept",
      "Origin",
      "X-Api-Key",
      "content-type",
      "Authorization",
      "Acces-Control-Request-Methods",
      "Access-Control-Allow-Credentials",
      "Access-Control-Allow-Headers",
      "X-Requested-With",
    ]
});

  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT);

}
bootstrap();