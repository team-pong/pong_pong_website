import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin';
import { Chat } from 'src/entities/chat';
import { ChatUsers } from 'src/entities/chat-users';
import { Users } from 'src/entities/users';
import { ChatUsersController } from './chat-users.controller';
import { ChatUsersService } from './chat-users.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChatUsers, Users, Chat, Admin])],
  controllers: [ChatUsersController],
  providers: [ChatUsersService],
  exports: [ChatUsersService],
})
export class ChatUsersModule {}
