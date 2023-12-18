import { Controller, Get, Post, Param, Body, UseGuards} from "@nestjs/common";
import { MatchHistoryService } from "../services/match.history.services";
import { Game } from "../entities/game-entity";
import { UsersService } from "src/users/services/users.service";
import { User } from "src/users/entities/user.entity";
import { AccessTokenGuard } from "src/auth/guards/accessToken.auth.guard";
import { NotFoundException } from "@nestjs/common";

@Controller('games')
export class GamesController {
    constructor(
        private readonly  matchHistoryService: MatchHistoryService,
        private readonly  userService: UsersService,
    ) {}

}
