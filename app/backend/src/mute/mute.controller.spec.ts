import { Test, TestingModule } from '@nestjs/testing';
import { MuteController } from './mute.controller';

describe('MuteController', () => {
  let controller: MuteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MuteController],
    }).compile();

    controller = module.get<MuteController>(MuteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
