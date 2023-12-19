import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity';
import { AuthService } from 'src/auth/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AvatarService } from './services/avatar.service';
import { Avatar
 } from './entities/avatar.entity';
import { MatchHistoryService } from 'src/game/services/match.history.services';
import { Game } from 'src/game/entities/game-entity';
import { FriendRequest } from './entities/friendRequest.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User, FriendRequest]), TypeOrmModule.forFeature([Avatar]), TypeOrmModule.forFeature([Game])],
  controllers: [UsersController],
  providers: [UsersService, AuthService, JwtService, AvatarService, MatchHistoryService],
  exports: [UsersService]
})
export class UsersModule {}
