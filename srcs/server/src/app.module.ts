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
      entities: [User, Avatar, Game],
      synchronize: true,
    }),
    UsersModule,
    GameModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, GameModule],
})

export class AppModule { }

