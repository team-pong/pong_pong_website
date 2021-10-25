import { forwardRef, Module } from '@nestjs/common';
import { GlobalController } from './global.controller';
import { GlobalService } from './global.service';
import { GlobalGateway } from './global.gateway';
import { FriendModule } from 'src/friend/friend.module';
import { SessionModule } from 'src/session/session.module';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/users';
import { Friend } from 'src/entities/friend';
import { DmStoreModule } from 'src/dm-store/dm-store.module';
import { Block } from 'src/entities/block';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      Friend,
      Block
    ]),
    SessionModule,
    FriendModule,
    UsersModule,
    DmStoreModule,
  ],
  controllers: [GlobalController],
  providers: [GlobalService, GlobalGateway],
  exports: [GlobalService],
})
export class GlobalModule {}
