import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from 'src/entities/friend';
import { Users } from 'src/entities/users';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';

@Module({
  imports: [TypeOrmModule.forFeature([Friend, Users])],
  controllers: [FriendController],
  providers: [FriendService],
})
export class FriendModule {}
