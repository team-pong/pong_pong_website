import { Module } from '@nestjs/common';
import { GlobalController } from './global.controller';
import { GlobalService } from './global.service';
import { GlobalGateway } from './global.gateway';
import { FriendModule } from 'src/friend/friend.module';
import { SessionModule } from 'src/session/session.module';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/users';
import { Friend } from 'src/entities/friend';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      Friend,
    ]),
    FriendModule, 
    SessionModule, 
    UsersModule],
  controllers: [GlobalController],
  providers: [GlobalService, GlobalGateway],
  exports: [GlobalService],
})
export class GlobalModule {}
