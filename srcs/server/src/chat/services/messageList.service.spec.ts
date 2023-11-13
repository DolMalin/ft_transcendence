import { Test, TestingModule } from '@nestjs/testing';
import { MessageListController } from '../controllers/message-room.controller';
import { RoomService } from './room.service';

describe('MessageListController', () => {
  let controller: MessageListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageListController],
      providers: [RoomService],
    }).compile();

    controller = module.get<MessageListController>(MessageListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
