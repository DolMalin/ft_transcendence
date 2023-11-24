import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../entities/game-entity';
import { Repository } from 'typeorm';
import { CreateGameDto } from '../dto/create.game.dto';
import { UsersService } from 'src/users/services/users.service';


@Injectable()
export class MatchHistoryService {

    constructor(
        @InjectRepository(Game)
        private gameRepository: Repository<Game>,

        private readonly usersService : UsersService
    ) {}

    async storeGameResults(createGameDto : CreateGameDto): Promise<Game> {

        console.log('jacquouille')
        let newGame = this.gameRepository.create(createGameDto);
        newGame = await this.gameRepository.save(newGame)
        this.addGameToUsersPlayedGames(newGame)
        console.log('hubert')
        return (newGame)
    }

    addGameToUsersPlayedGames(game : Game) {
        
        this.usersService.addGameToLooserPlayedGames(game);
        // this.usersService.addGameToWinnerPlayedGames(game);
    }
}