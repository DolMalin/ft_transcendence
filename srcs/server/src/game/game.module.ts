import { Module } from '@nestjs/common'
import { GameGateway } from './gateway/game.gateway'
import { GamePlayService } from './services/gameplay.services'
import { MatchmakingService } from './services/match-making-services'
import { MatchHistoryService } from './services/match.history.services'
import { GamesController } from './controllers/game.controller'
import { UsersService } from 'src/users/services/users.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Game } from './entities/game-entity'
import { User } from 'src/users/entities/user.entity'
import { Avatar } from 'src/users/entities/avatar.entity'
import { AvatarService } from 'src/users/services/avatar.service'
import { AuthService } from 'src/auth/services/auth.service'
import { JwtService } from '@nestjs/jwt'
import { FriendRequest } from 'src/users/entities/friendRequest.entity'


@Module({
  
    imports: [TypeOrmModule.forFeature([Game]), TypeOrmModule.forFeature([User, FriendRequest]), TypeOrmModule.forFeature([Avatar])],
    controllers: [GamesController],
    providers: [JwtService,GameGateway, MatchmakingService, GamePlayService, MatchHistoryService, UsersService, AvatarService, AuthService],
    exports: [MatchHistoryService]
  })
export class GameModule {}
