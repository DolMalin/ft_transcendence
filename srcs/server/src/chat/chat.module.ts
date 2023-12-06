import { ChatGateway } from "./chat.gateway";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm'
import { Room } from "./entities/room.entity";
import { RoomController } from "./controllers/room.controller";
import { RoomService } from "./services/room.service";
import { MessageService } from "./services/message.service";
import { MessageController } from "./controllers/message.controller";
import { Message } from "./entities/message.entity";
import { AuthModule } from "src/auth/auth.module";
import { AuthService } from "src/auth/services/auth.service";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/services/users.service";
import { User } from "src/users/entities/user.entity";
import { Avatar } from "src/users/entities/avatar.entity";
import { AvatarService } from "src/users/services/avatar.service";
@Module({
    imports: [TypeOrmModule.forFeature([Room]), TypeOrmModule.forFeature([Message]), AuthModule, JwtModule, TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([Avatar])] ,
    controllers: [RoomController, MessageController],
    providers: [ChatGateway, RoomService, MessageService, JwtService, UsersService, AuthService, AvatarService],
    exports: [RoomService, MessageService, ChatGateway]
    //Export roomService si besoin est
})
export class ChatModule {}