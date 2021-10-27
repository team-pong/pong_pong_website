import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from 'src/chat/chat.module';
import { Admin } from 'src/entities/admin';
import { Ban } from 'src/entities/ban';
import { Chat } from 'src/entities/chat';
import { ChatUsers } from 'src/entities/chat-users';
import { Mute } from 'src/entities/mute';
import { Users } from 'src/entities/users';
import { SessionModule } from 'src/session/session.module';
import { UsersModule } from 'src/users/users.module';
import { ChatUsersController } from './chat-users.controller';
import { ChatUsersService } from './chat-users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatUsers, Users, Chat, Admin, Ban, Mute]),
    forwardRef(() => UsersModule),
    forwardRef(() => ChatModule),
    forwardRef(() => SessionModule),
  ],
  controllers: [ChatUsersController],
  providers: [ChatUsersService],
  exports: [ChatUsersService],
})
export class ChatUsersModule {}
