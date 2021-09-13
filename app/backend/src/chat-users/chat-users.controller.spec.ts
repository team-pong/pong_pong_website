import { Test, TestingModule } from '@nestjs/testing';
import { ChatUsersController } from './chat-users.controller';

describe('ChatUsersController', () => {
  let controller: ChatUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatUsersController],
    }).compile();

    controller = module.get<ChatUsersController>(ChatUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
