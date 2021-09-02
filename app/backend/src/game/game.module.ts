import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

/*
* Game 페이지 관련 모듈
* 1. 매칭 시스템
* 2. 대전 소켓 통신
*/
@Module({
	imports: [GameService],
  controllers: [GameController],
  providers: [GameService, GameGateway]
})
export class GameModule {}
