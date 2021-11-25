import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { RejectGameDto } from 'src/dto/game';
import { UsersService } from 'src/users/users.service';
import { GameGateway } from './game.gateway';


@Controller('game')
export class GameController {
	constructor(
		private gameGatway: GameGateway,
		private userService: UsersService,
	) {}

	@Post('reject')
	async rejectGame(@Req() req: Request, @Body() body: RejectGameDto) {
		const target_info = await this.userService.getUserInfoWithNick(body.from);
		this.gameGatway.rejectGame(target_info.user_id);
		return {};
	}
}
