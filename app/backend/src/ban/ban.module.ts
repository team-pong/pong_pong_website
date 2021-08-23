import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin';
import { Ban } from 'src/entities/ban';
import { Chat } from 'src/entities/chat';
import { ChatUsers } from 'src/entities/chat-users';
import { Users } from 'src/entities/users';
import { BanController } from './ban.controller';
import { BanService } from './ban.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ban, Users, Chat, ChatUsers, Admin])],
  controllers: [BanController],
  providers: [BanService],
})
export class BanModule {}
