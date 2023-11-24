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
import { JwtModule } from "@nestjs/jwt";
@Module({
    imports: [TypeOrmModule.forFeature([Room]), TypeOrmModule.forFeature([Message]), AuthModule, JwtModule] ,
    controllers: [RoomController, MessageController],
    providers: [ChatGateway, RoomService, MessageService],
    exports: [RoomService, MessageService]
    //Export roomService si besoin est
})
export class ChatModule {}