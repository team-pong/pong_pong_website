import { Test, TestingModule } from '@nestjs/testing';
import { ChatUsersService } from './chat-users.service';

describe('ChatUsersService', () => {
  let service: ChatUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatUsersService],
    }).compile();

    service = module.get<ChatUsersService>(ChatUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
