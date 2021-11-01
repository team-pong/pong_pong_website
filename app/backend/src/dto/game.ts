import { IsIn, IsInstance, IsNotEmpty, IsString } from "class-validator";

export class GameMapDto {
	@IsIn(['0', '1', '2'])
	@IsNotEmpty()
	map: string;
}

export class SpectateGameDto {
	@IsString()
	@IsNotEmpty()
	nick: string;
}