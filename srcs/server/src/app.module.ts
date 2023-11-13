import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { NestModule } from '@nestjs/common';

// Entities
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { Room } from './chat/entities/room.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'database',
      port: Number(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER,
      database: process.env.DATABASE_NAME,
      password: process.env.DATABASE_PASSWORD,
      entities: [User, Room],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChatModule],
})

export class AppModule { }

