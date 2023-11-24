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


@Module({
  
    imports: [TypeOrmModule.forFeature([Game]), TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([Avatar])],
    controllers: [GamesController],
    providers: [GameGateway, MatchmakingService, GamePlayService, MatchHistoryService, UsersService, AvatarService],
    exports: [MatchHistoryService]
  })
export class GameModule {}
