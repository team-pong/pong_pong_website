import { Module } from '@nestjs/common';
import { GlobalController } from './global.controller';
import { GlobalService } from './global.service';
import { GlobalGateway } from './global.gateway';

@Module({
  imports: [],
  controllers: [GlobalController],
  providers: [GlobalService, GlobalGateway],
  exports: [GlobalService],
})
export class GlobalModule {}
