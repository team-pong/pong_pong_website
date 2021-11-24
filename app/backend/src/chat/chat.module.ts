import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from 'src/entities/chat';
import { ChatUsers } from 'src/entities/chat-users';
import { Users } from 'src/entities/users';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { UsersModule } from 'src/users/users.module';
import { Admin } from 'src/entities/admin';
import { GlobalModule } from 'src/global/global.module';
import { SessionModule } from 'src/session/session.module';
import { ChatUsersModule } from 'src/chat-users/chat-users.module';
import { AdminModule } from 'src/admin/admin.module';
import { BanModule } from 'src/ban/ban.module';
import { MuteModule } from 'src/mute/mute.module';
import { Block } from 'src/entities/block';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Chat, ChatUsers, Admin, Block]),
    forwardRef(() => UsersModule),
    forwardRef(() => GlobalModule),
    forwardRef(() => SessionModule),
    forwardRef(() => ChatUsersModule),
    forwardRef(() => AdminModule),
    forwardRef(() => BanModule),
    forwardRef(() => MuteModule),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
