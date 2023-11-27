import { Module } from '@nestjs/common'
import { GameGateway } from './gateway/game.gateway'
import { MatchmakingService,
GamePlayService } from './services/game.services'
import { MatchHistoryService } from './services/match.history.services'
import { GamesController } from './controllers/game.controller'
import { UsersService } from 'src/users/services/users.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Game } from './entities/game-entity'
import { User } from 'src/users/entities/user.entity'
import { Avatar } from 'src/users/entities/avatar.entity'
import { AvatarService } from 'src/users/services/avatar.service'
import { JwtModule, JwtService } from '@nestjs/jwt'


@Module({
  
    imports: [JwtModule.register({ secret : "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" })
    , TypeOrmModule.forFeature([Game]), TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([Avatar])],
    controllers: [GamesController],
    providers: [JwtService, GameGateway, MatchmakingService, GamePlayService, MatchHistoryService, UsersService, AvatarService],
    exports: [MatchHistoryService]
  })
export class GameModule {}
