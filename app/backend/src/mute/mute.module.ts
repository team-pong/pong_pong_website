import { Module } from '@nestjs/common';
import { MuteController } from './mute.controller';
import { MuteService } from './mute.service';

@Module({
  controllers: [MuteController],
  providers: [MuteService]
})
export class MuteModule {}
