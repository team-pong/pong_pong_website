import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as ormconfig from '../ormconfig';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { achievementsModule } from './achievements/achievements.module';
import { UsersModule } from './users/users.module';
import { MatchModule } from './match/match.module';
import { ChatModule } from './chat/chat.module';
import { BanModule } from './ban/ban.module';
import { AdminModule } from './admin/admin.module';
import { MuteModule } from './mute/mute.module';
import { FriendModule } from './friend/friend.module';
import { DmStoreModule } from './dm-store/dm-store.module';
import { SessionModule } from './session/session.module';
import { ChatUsersModule } from './chat-users/chat-users.module';
import { BlockModule } from './block/block.module';
import { GameModule } from './game/game.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GlobalModule } from './global/global.module';
import { QuestionsModule } from './questions/questions.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
		TypeOrmModule.forRoot(ormconfig),
    achievementsModule, 
    UsersModule, 
    MatchModule, 
    ChatModule, 
    BanModule, 
    AdminModule, 
    MuteModule, 
    FriendModule, 
    DmStoreModule, 
    SessionModule,
    ChatUsersModule,
    BlockModule,
    GameModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'client'),
    }),
    GlobalModule,
    QuestionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
