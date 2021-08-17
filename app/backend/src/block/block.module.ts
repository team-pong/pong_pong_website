import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block } from 'src/entities/block';
import { Friend } from 'src/entities/friend';
import { Users } from 'src/entities/users';
import { BlockController } from './block.controller';
import { BlockService } from './block.service';

@Module({
  imports: [TypeOrmModule.forFeature([Block, Users, Friend])],
  controllers: [BlockController],
  providers: [BlockService],
})
export class BlockModule {}
