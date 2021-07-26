import { Test, TestingModule } from '@nestjs/testing';
import { StatService } from './stat.service';

describe('StatService', () => {
  let service: StatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatService],
    }).compile();

    service = module.get<StatService>(StatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
