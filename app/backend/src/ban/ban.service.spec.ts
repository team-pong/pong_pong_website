import { Test, TestingModule } from '@nestjs/testing';
import { BanService } from './ban.service';

describe('BanService', () => {
  let service: BanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BanService],
    }).compile();

    service = module.get<BanService>(BanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
