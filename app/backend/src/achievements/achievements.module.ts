import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievements } from 'src/entities/achievements';
import { Users } from 'src/entities/users';
import { achievementsController } from './achievements.controller';
import { achievementsService } from './achievements.service';

@Module({
  imports: [TypeOrmModule.forFeature([Achievements, Users])],
  controllers: [achievementsController],
  providers: [achievementsService],
  exports: [achievementsService]
})
export class achievementsModule {}
