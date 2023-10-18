import { Module } from '@nestjs/common'
import { GameGateway } from './game.gateway'
import { MatchmakingService } from './game.service'

@Module({
    providers: [GameGateway, MatchmakingService],
})
export class GameModule {}
