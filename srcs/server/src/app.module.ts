import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Game } from './game/entities/game-entity';
import { NestModule } from '@nestjs/common';

import { UsersModule } from './users/users.module';
import { GameModule } from './game/game.module';

import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { Room } from './chat/entities/room.entity';
import { Message } from './chat/entities/message.entity';
import { Avatar } from './users/entities/avatar.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'database',
      port: Number(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER,
      database: process.env.DATABASE_NAME,
      password: process.env.DATABASE_PASSWORD,
      entities: [User, Room, Message, Avatar, Game],
      // entities: [User, Avatar, Game],
      synchronize: true,
      // dropSchema: true,/*  wipe la db a chaque refresh */
    }),
    UsersModule,
    GameModule,
    AuthModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule { }

