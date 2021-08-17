import { Module } from '@nestjs/common';
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
import { achievementsService } from 'src/achievements/achievements.service';
import { AdminService } from 'src/admin/admin.service';
import { BanService } from 'src/ban/ban.service';
import { BlockService } from 'src/block/block.service';
import { DmStoreService } from 'src/dm-store/dm-store.service';
import { FriendService } from 'src/friend/friend.service';
import { MatchService } from 'src/match/match.service';
import { MuteService } from 'src/mute/mute.service';
import { Chat } from 'src/entities/chat';
import { ChatUsers } from 'src/entities/chat-users';

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
  ],
  controllers: [UsersController],
  providers: [
    UsersService, 
    achievementsService, 
    AdminService, 
    BanService, 
    BlockService,
    DmStoreService, 
    FriendService, 
    MatchService, 
    MuteService
  ]
})
export class UsersModule {}