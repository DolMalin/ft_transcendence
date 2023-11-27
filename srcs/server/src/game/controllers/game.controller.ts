import { Controller, Get, Post, Param, Body, UseGuards} from "@nestjs/common";
import { MatchHistoryService } from "../services/match.history.services";
import { Game } from "../entities/game-entity";
import { UsersService } from "src/users/services/users.service";
import { User } from "src/users/entities/user.entity";
import { CreateGameDto } from "../dto/game.dto";
import { AccessTokenGuard } from "src/auth/guards/accessToken.auth.guard";

@Controller('games')
export class GamesController {
    constructor(
        private readonly  matchHistoryService: MatchHistoryService,
        private readonly  userService: UsersService,
    ) {}

    // @UseGuards(AccessTokenGuard)
    @Post()
    async updateHistory(createGameDto : CreateGameDto): Promise<Game> {

        const newGame = this.matchHistoryService.storeGameResults(createGameDto);
        this.matchHistoryService.addGameToUsersHistory(createGameDto);
        return (newGame)
    }

    // @UseGuards(AccessTokenGuard)
    @Get(':id')
    async findUserHistory(@Param('id') id : string): Promise<Game[]>
    {
        return (this.userService.findOneById(id).then((res : User) => {
            return (res.playedGames);
        }))
    }
}