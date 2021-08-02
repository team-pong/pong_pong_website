import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievements } from 'src/entities/achievements';
import { Users } from 'src/entities/users';
import { AchivementsController } from './achivements.controller';
import { AchivementsService } from './achivements.service';

@Module({
  imports: [TypeOrmModule.forFeature([Achievements, Users])],
  controllers: [AchivementsController],
  providers: [AchivementsService],
  exports: [AchivementsService]
})
export class AchivementsModule {}
