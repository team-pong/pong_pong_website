import { Test, TestingModule } from '@nestjs/testing';
import { DmStoreController } from './dm-store.controller';

describe('DmStoreController', () => {
  let controller: DmStoreController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DmStoreController],
    }).compile();

    controller = module.get<DmStoreController>(DmStoreController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
