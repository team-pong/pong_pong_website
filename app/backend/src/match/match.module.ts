import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from 'src/entities/match';
import { Users } from 'src/entities/users';
import { UsersModule } from 'src/users/users.module';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, Users]),
    forwardRef(() => UsersModule),
  ],
  controllers: [MatchController],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}
