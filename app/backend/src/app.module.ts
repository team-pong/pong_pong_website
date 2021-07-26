import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as ormconfig from '../ormconfig';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AchivementsModule } from './achivements/achivements.module';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { MatchModule } from './match/match.module';
import { ChatModule } from './chat/chat.module';
import { StatModule } from './stat/stat.module';
import { BanModule } from './ban/ban.module';
import { AdminModule } from './admin/admin.module';
import { MuteModule } from './mute/mute.module';
import { FriendModule } from './friend/friend.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
		TypeOrmModule.forRoot(ormconfig),
    AchivementsModule, UsersModule, MatchModule, ChatModule, StatModule, BanModule, AdminModule, MuteModule, FriendModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
