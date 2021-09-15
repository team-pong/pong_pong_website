import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockModule } from 'src/block/block.module';
import { Achievements } from 'src/entities/achievements';
import { Admin } from 'src/entities/admin';
import { Ban } from 'src/entities/ban';
import { Block } from 'src/entities/block';
import { Chat } from 'src/entities/chat';
import { ChatUsers } from 'src/entities/chat-users';
import { DmStore } from 'src/entities/dm-store';
import { Friend } from 'src/entities/friend';
import { Match } from 'src/entities/match';
import { Mute } from 'src/entities/mute';
import { session } from 'src/entities/session';
import { Users } from 'src/entities/users';
import { SessionModule } from 'src/session/session.module';
import { UsersModule } from 'src/users/users.module';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      session,
      Users, 
      Achievements, 
      Admin, 
      Ban, 
      Block, 
      Chat,
      ChatUsers,
      DmStore, 
      Friend, 
      Match, 
      Mute
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => SessionModule),
    forwardRef(() => BlockModule),
  ],
  controllers: [FriendController],
  providers: [FriendService],
  exports: [FriendService],
})
export class FriendModule {}
