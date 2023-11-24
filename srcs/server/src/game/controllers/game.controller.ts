import { Controller, Get, Post, Param, Body, UseGuards} from "@nestjs/common";
import { MatchHistoryService } from "../services/match.history.services";
import { Game } from "../entities/game-entity";
import { UsersService } from "src/users/services/users.service";
import { User } from "src/users/entities/user.entity";
import { CreateGameDto } from "../dto/create.game.dto";
import { AccessTokenGuard } from "src/auth/guards/accessToken.auth.guard";
import { GetUser } from "src/users/decorator/user.decorator";
import { UpdateGameDto } from "../dto/update.game.dto";
import { GameState } from "../globals/interfaces";

@Controller('games')
export class GamesController {
    constructor(
        private readonly  matchHistoryService: MatchHistoryService,
        private readonly  userService: UsersService,
    ) {}


    @Get()
    async findAll(): Promise<Game[]> {
        const gameArray : Game[]= []
        return (gameArray)
    }


    // @UseGuards(AccessTokenGuard)
    //this route will disapear
    // @Post()
    // async addGameToDB(@Body()game : GameState): Promise<Game> {

    //     const newGame = await this.matchHistoryService.storeGameResults(game);
    //     console.log('Ginette :', newGame);
    //     return (newGame);
    // }

    // @UseGuards(AccessTokenGuard)
    @Get(':id')
    async findUserHistory(@Param('id') id : string): Promise<Game[]>
    {
        return (this.userService.findOneById(id).then((res : User) => {
            return (res.playedGames);
        }))
    }
}