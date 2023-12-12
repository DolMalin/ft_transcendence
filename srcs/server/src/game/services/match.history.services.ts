import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
        private readonly usersService : UsersService
    ) {}

    async storeGameResults(game : GameState): Promise<Game> {
        const winner = await this.usersService.findOneById(game.winner)
        const looser = await this.usersService.findOneById(game.looser)

        if (!winner || !looser)
            throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'Cannot find user'})

        const createDto : CreateGameDto = {
            winnerId : game.winner,
            winnerUsername : winner.username,
            winnerScore : game.winner === game.clientOne.id ? game.clientOneScore : game.clientTwoScore,
            looserId : game.looser,
            looserUsername : looser.username,
            looserScore: game.looser === game.clientOne.id ? game.clientOneScore : game.clientTwoScore,
        }
        
        let newGame = this.gameRepository.create(createDto)
        if (!newGame)
            throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'Cannot create game'})

        newGame = await this.gameRepository.save(newGame)
        if (!newGame)
            throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'Cannot create game'})
            
        await this.addGameToUsersPlayedGames(newGame)
        return (newGame)

    }

    async addGameToUsersPlayedGames(game : Game) {
        
        await this.addGameToLooserPlayedGames(game);
        await this.addGameToWinnerPlayedGames(game);
    }
    
    async addGameToWinnerPlayedGames(game : Game) {

        const winner = await this.usersService.findOneWitOptions({relations : {playedGames: true},where: {id : game.winnerId }})
        if (!winner)
            throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'Cannot find user'})
        
        if (winner.playedGames === undefined)
            winner.playedGames = [];
            
        winner.playedGames.push(game);
        winner.winsAmount ++;

        return await this.usersService.save(winner)

    }

    async addGameToLooserPlayedGames(game : Game)
    {
        
        const looser = await this.usersService.findOneWitOptions({relations : {playedGames: true},where: {id : game.looserId }})
        if (!looser)
            throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'Cannot find user'})
        
        if (looser.playedGames === undefined)
            looser.playedGames = [];
        looser.playedGames.push(game);
        looser.loosesAmount ++;

        return await this.usersService.save(looser)

    }


  async returnHistory(userId : string){

      const user = await this.usersService.findOneWitOptions({relations : {playedGames: true},where: {id : userId}})
      if (!user)
        throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'Cannot find user'})

      return (user.playedGames.reverse());
    }
}