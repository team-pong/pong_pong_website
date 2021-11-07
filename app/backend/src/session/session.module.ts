import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { Users } from 'src/entities/users';
import { session } from 'src/entities/session';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { UsersModule } from 'src/users/users.module';
import { AuthCode } from 'src/entities/auth-code';

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
      Mute,
      session,
      AuthCode
    ])
  ],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule { }
