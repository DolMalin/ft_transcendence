import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../entities/game-entity';
import { Repository } from 'typeorm';
import { CreateGameDto } from '../dto/game.dto';


@Injectable()
export class MatchHistoryService {

    constructor(
        @InjectRepository(Game)
        private gameRepository: Repository<Game>
    ) {}

    async storeGameResults(createGameDto : CreateGameDto) {

        const newGame = this.gameRepository.create(createGameDto);
        return (this.gameRepository.save(newGame))
    }

    addGameToUsersHistory(createGameDto : CreateGameDto) {
        
    }
}