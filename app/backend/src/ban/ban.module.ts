import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin';
import { Ban } from 'src/entities/ban';
import { Chat } from 'src/entities/chat';
import { ChatUsers } from 'src/entities/chat-users';
import { Users } from 'src/entities/users';
import { UsersModule } from 'src/users/users.module';
import { BanController } from './ban.controller';
import { BanService } from './ban.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ban, Users, Chat, ChatUsers, Admin]),
    forwardRef(() => UsersModule),
  ],
  controllers: [BanController],
  providers: [BanService],
  exports: [BanService],
})
export class BanModule {}
