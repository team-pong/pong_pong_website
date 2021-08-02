import { Test, TestingModule } from '@nestjs/testing';
import { achievementsService } from './achievements.service';

describe('achievementsService', () => {
  let service: achievementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [achievementsService],
    }).compile();

    service = module.get<achievementsService>(achievementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
