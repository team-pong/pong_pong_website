import { Module } from '@nestjs/common';
import { BanController } from './ban.controller';
import { BanService } from './ban.service';

@Module({
  controllers: [BanController],
  providers: [BanService]
})
export class BanModule {}
