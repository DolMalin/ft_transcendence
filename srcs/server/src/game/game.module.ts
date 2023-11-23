import { Module } from '@nestjs/common'
import { GameGateway } from './gateway/game.gateway'
import { MatchmakingService,
GamePlayService } from './services/game.services'
import { MatchHistoryService } from './services/match.history.services'

@Module({
    providers: [GameGateway, MatchmakingService, GamePlayService, MatchHistoryService],
})
export class GameModule {}
