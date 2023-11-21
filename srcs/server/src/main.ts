import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(cookieParser())
  // app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    credentials: true,
    origin: [process.env.CLIENT_URL, process.env.SERVER_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Acces-Control-Request-Methods",
      "Access-Control-Allow-Credentials",
      "Access-Control-Allow-Headers"
    ]
  })
  
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  await app.listen(process.env.PORT, '0.0.0.0');
}
bootstrap();