import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from 'src/admin/admin.module';
import { ChatModule } from 'src/chat/chat.module';
import { Admin } from 'src/entities/admin';
import { Chat } from 'src/entities/chat';
import { ChatUsers } from 'src/entities/chat-users';
import { Mute } from 'src/entities/mute';
import { Users } from 'src/entities/users';
import { SessionModule } from 'src/session/session.module';
import { UsersModule } from 'src/users/users.module';
import { MuteController } from './mute.controller';
import { MuteService } from './mute.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mute, Users, Chat, ChatUsers, Admin]),
    forwardRef(() => UsersModule),
    forwardRef(() => SessionModule),
    forwardRef(() => ChatModule),
    forwardRef(() => AdminModule),
  ],
  controllers: [MuteController],
  providers: [MuteService],
  exports: [MuteService],
})
export class MuteModule {}
