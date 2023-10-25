import { Module } from '@nestjs/common'
import { GameGateway } from './game.gateway'
import { MatchmakingService,
GamePlayService } from './game.service'

@Module({
    providers: [GameGateway, MatchmakingService, GamePlayService],
})
export class GameModule {}
