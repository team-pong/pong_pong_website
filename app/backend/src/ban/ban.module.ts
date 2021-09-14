import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from 'src/admin/admin.module';
import { ChatModule } from 'src/chat/chat.module';
import { Admin } from 'src/entities/admin';
import { Ban } from 'src/entities/ban';
import { Chat } from 'src/entities/chat';
import { ChatUsers } from 'src/entities/chat-users';
import { Users } from 'src/entities/users';
import { SessionModule } from 'src/session/session.module';
import { UsersModule } from 'src/users/users.module';
import { BanController } from './ban.controller';
import { BanService } from './ban.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ban, Users, Chat, ChatUsers, Admin]),
    forwardRef(() => UsersModule),
    forwardRef(() => SessionModule),
    forwardRef(() => ChatModule),
    forwardRef(() => AdminModule),
  ],
  controllers: [BanController],
  providers: [BanService],
  exports: [BanService],
})
export class BanModule {}
