import { Test, TestingModule } from '@nestjs/testing';
import { DmStoreService } from './dm-store.service';

describe('DmStoreService', () => {
  let service: DmStoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DmStoreService],
    }).compile();

    service = module.get<DmStoreService>(DmStoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
