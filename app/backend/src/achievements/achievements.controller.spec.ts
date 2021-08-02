import { Test, TestingModule } from '@nestjs/testing';
import { achievementsController } from './achievements.controller';

describe('achievementsController', () => {
  let controller: achievementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [achievementsController],
    }).compile();

    controller = module.get<achievementsController>(achievementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
