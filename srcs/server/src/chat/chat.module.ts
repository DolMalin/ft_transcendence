import { ChatGateway } from "./chat.gateway";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm'
import { Room } from "./entities/room.entity";
import { RoomController } from "./controllers/room.controller";
import { RoomService } from "./services/room.service";

@Module({
    imports: [TypeOrmModule.forFeature([Room])],
    controllers: [RoomController],
    providers: [ChatGateway, RoomService],
    exports: [RoomService]
    //Export roomService si besoin est
})
export class ChatModule {}