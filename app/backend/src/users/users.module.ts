import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/users';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Achievements } from 'src/entities/achievements';
import { Admin } from 'src/entities/admin';
import { Ban } from 'src/entities/ban';
import { Block } from 'src/entities/block';
import { DmStore } from 'src/entities/dm-store';
import { Friend } from 'src/entities/friend';
import { Match } from 'src/entities/match';
import { Mute } from 'src/entities/mute';
import { Chat } from 'src/entities/chat';
import { ChatUsers } from 'src/entities/chat-users';
import { achievementsModule } from 'src/achievements/achievements.module';
import { AdminModule } from 'src/admin/admin.module';
import { BanModule } from 'src/ban/ban.module';
import { BlockModule } from 'src/block/block.module';
import { DmStoreModule } from 'src/dm-store/dm-store.module';
import { FriendModule } from 'src/friend/friend.module';
import { MatchModule } from 'src/match/match.module';
import { MuteModule } from 'src/mute/mute.module';
import { SessionModule } from 'src/session/session.module';
import { GlobalModule } from 'src/global/global.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
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
    forwardRef(() => achievementsModule),
    forwardRef(() => AdminModule),
    forwardRef(() => BanModule),
    forwardRef(() => BlockModule),
    forwardRef(() => DmStoreModule),
    forwardRef(() => FriendModule),
    forwardRef(() => MatchModule),
    forwardRef(() => MuteModule),
    forwardRef(() => SessionModule),
    forwardRef(() => GlobalModule)
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}