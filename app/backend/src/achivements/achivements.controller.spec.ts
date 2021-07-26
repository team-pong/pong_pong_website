import { Test, TestingModule } from '@nestjs/testing';
import { AchivementsController } from './achivements.controller';

describe('AchivementsController', () => {
  let controller: AchivementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AchivementsController],
    }).compile();

    controller = module.get<AchivementsController>(AchivementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
