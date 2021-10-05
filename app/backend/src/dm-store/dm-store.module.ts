import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DmStore } from 'src/entities/dm-store';
import { Users } from 'src/entities/users';
import { SessionModule } from 'src/session/session.module';
import { UsersModule } from 'src/users/users.module';
import { DmStoreController } from './dm-store.controller';
import { DmStoreService } from './dm-store.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DmStore, Users]),
    forwardRef(() => UsersModule),
    forwardRef(() => SessionModule),
    // UsersModule,
  ],
  controllers: [DmStoreController],
  providers: [DmStoreService],
  exports: [DmStoreService],
})
export class DmStoreModule {}
