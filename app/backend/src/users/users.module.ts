import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/users';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AchivementsModule } from 'src/achivements/achivements.module'
import { AdminModule } from 'src/admin/admin.module';
import { BanModule } from 'src/ban/ban.module';
import { BlockModule } from 'src/block/block.module';
import { DmStoreModule } from 'src/dm-store/dm-store.module';
import { FriendModule } from 'src/friend/friend.module';
import { MatchModule } from 'src/match/match.module';
import { MuteModule } from 'src/mute/mute.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    AchivementsModule,
    AdminModule,
    BanModule,
    BlockModule,
    DmStoreModule,
    FriendModule,
    MatchModule,
    MuteModule,
  ],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}