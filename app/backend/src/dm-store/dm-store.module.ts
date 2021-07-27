import { Module } from '@nestjs/common';
import { DmStoreController } from './dm-store.controller';
import { DmStoreService } from './dm-store.service';

@Module({
  controllers: [DmStoreController],
  providers: [DmStoreService]
})
export class DmStoreModule {}
