import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
    origin: ["http://localhost:4545", "http://localhost:4343"],
    methods: ["GET", "POST", "PUT", "DELETE"],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Acces-Control-Request-Methods",
      "Access-Control-Allow-Credentials",
      "Access-Control-Allow-Headers"
    ]
  })

  await app.listen(process.env.PORT);
}
bootstrap();
