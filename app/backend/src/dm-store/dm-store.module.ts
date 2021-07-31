import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DmStore } from 'src/entities/dm-store';
import { Users } from 'src/entities/users';
import { DmStoreController } from './dm-store.controller';
import { DmStoreService } from './dm-store.service';

@Module({
  imports: [TypeOrmModule.forFeature([DmStore, Users])],

  controllers: [DmStoreController],
  providers: [DmStoreService]
})
export class DmStoreModule {}
