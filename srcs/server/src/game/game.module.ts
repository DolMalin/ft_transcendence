import { Module } from '@nestjs/common'
import { GameGateway } from './gateway/game.gateway'
import { MatchmakingService,
GamePlayService } from './services/game.service'

@Module({
    providers: [GameGateway, MatchmakingService, GamePlayService],
})
export class GameModule {}
