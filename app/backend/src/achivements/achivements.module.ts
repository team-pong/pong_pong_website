import { Module } from '@nestjs/common';
import { AchivementsController } from './achivements.controller';
import { AchivementsService } from './achivements.service';

@Module({
  controllers: [AchivementsController],
  providers: [AchivementsService]
})
export class AchivementsModule {}
