import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from 'src/chat/chat.module';
import { Admin } from 'src/entities/admin';
import { Chat } from 'src/entities/chat';
import { ChatUsers } from 'src/entities/chat-users';
import { Users } from 'src/entities/users';
import { UsersModule } from 'src/users/users.module';
import { ChatUsersController } from './chat-users.controller';
import { ChatUsersService } from './chat-users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatUsers, Users, Chat, Admin]),
    forwardRef(() => UsersModule),
    forwardRef(() => ChatModule),
  ],
  controllers: [ChatUsersController],
  providers: [ChatUsersService],
  exports: [ChatUsersService],
})
export class ChatUsersModule {}
