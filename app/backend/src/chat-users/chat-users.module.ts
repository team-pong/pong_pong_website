import { Module } from '@nestjs/common';
import { ChatUsersController } from './chat-users.controller';
import { ChatUsersService } from './chat-users.service';

@Module({
  controllers: [ChatUsersController],
  providers: [ChatUsersService]
})
export class ChatUsersModule {}
