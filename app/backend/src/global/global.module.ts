import { forwardRef, Global, Module } from '@nestjs/common';
import { GlobalController } from './global.controller';
import { GlobalService } from './global.service';
import { GlobalGateway } from './global.gateway';
import { SessionModule } from 'src/session/session.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/users';
import { Friend } from 'src/entities/friend';
import { Block } from 'src/entities/block';
import { DmStore } from 'src/entities/dm-store';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      Friend,
      Block,
      DmStore
    ]),
    forwardRef(() => SessionModule)
  ],
  controllers: [GlobalController],
  providers: [GlobalService, GlobalGateway],
  exports: [GlobalService],
})
export class GlobalModule {}
