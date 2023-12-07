import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../entities/game-entity';
import { Repository } from 'typeorm';
import { CreateGameDto } from '../dto/create.game.dto';
import { UsersService } from 'src/users/services/users.service';
import { User } from 'src/users/entities/user.entity';
import { GameState } from '../globals/interfaces';


@Injectable()
export class MatchHistoryService {

    constructor(
        @InjectRepository(Game)
        private gameRepository: Repository<Game>,

        @InjectRepository(User)
		private userRepository: Repository<User>,

        private readonly usersService : UsersService
    ) {}

    async storeGameResults(game : GameState): Promise<Game> {

        try {

            let createDto : CreateGameDto = {
                winnerId : game.winner,
                winnerUsername : (await this.usersService.findOneById(game.winner)).username,
                winnerScore : game.winner === game.clientOne.id ? game.clientOneScore : game.clientTwoScore,
                looserId : game.looser,
                looserUsername : (await this.usersService.findOneById(game.looser)).username,
                looserScore: game.looser === game.clientOne.id ? game.clientOneScore : game.clientTwoScore,
            }
            
            let newGame = this.gameRepository.create(createDto);
            newGame = await this.gameRepository.save(newGame)
            await this.addGameToUsersPlayedGames(newGame)
            return (newGame)
        }
        catch (e) {
            console.log('ERROR in adding game to DB : ', e.message)
        }
    }

    async addGameToUsersPlayedGames(game : Game) {
        
        await this.addGameToLooserPlayedGames(game);
        await this.addGameToWinnerPlayedGames(game);
    }
    
    async addGameToWinnerPlayedGames(game : Game) {

        const winner = await this.userRepository.findOne({relations : {playedGames: true},where: {id : game.winnerId }})
    
        if (winner.playedGames === undefined)
            winner.playedGames = [];
        winner.playedGames.push(game);
        winner.winsAmount ++;
        this.userRepository.save(winner);

    }

    async addGameToLooserPlayedGames(game : Game)
    {
        
        const looser = await this.userRepository.findOne({relations : {playedGames: true},where: {id : game.looserId }});
        
        if (looser.playedGames === undefined)
            looser.playedGames = [];
        looser.playedGames.push(game);
        looser.loosesAmount ++;
        this.userRepository.save(looser);
    }


  async returnHistory(userId : string){

    try {
      
      const res = await this.userRepository.findOne({relations : {playedGames: true},where: {id : userId}});
      return (res.playedGames.reverse());
    }
    catch (e) {
      console.log('Get History back : ', e.message)
      throw Error
    }
  }
}