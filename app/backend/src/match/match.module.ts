import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from 'src/entities/match';
import { Users } from 'src/entities/users';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';

@Module({
  imports: [TypeOrmModule.forFeature([Match, Users])],
  controllers: [MatchController],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}
