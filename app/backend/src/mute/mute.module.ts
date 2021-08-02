import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin';
import { Chat } from 'src/entities/chat';
import { ChatUsers } from 'src/entities/chat-users';
import { Mute } from 'src/entities/mute';
import { Users } from 'src/entities/users';
import { MuteController } from './mute.controller';
import { MuteService } from './mute.service';

@Module({
  imports: [TypeOrmModule.forFeature([Mute, Users, Chat, ChatUsers, Admin])],
  controllers: [MuteController],
  providers: [MuteService],
  exports: [MuteService],
})
export class MuteModule {}
