import { Test, TestingModule } from '@nestjs/testing';
import { AchivementsService } from './achivements.service';

describe('AchivementsService', () => {
  let service: AchivementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AchivementsService],
    }).compile();

    service = module.get<AchivementsService>(AchivementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
