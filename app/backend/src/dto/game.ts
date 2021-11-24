import { IsEmpty, IsIn, IsInstance, IsNotEmpty, IsString } from "class-validator";

export class NormalGameDto {
	@IsIn(['0', '1', '2'])
	@IsNotEmpty()
	map: string;
}

export class LadderGameDto extends NormalGameDto {}

export class InviteGameDto extends NormalGameDto {
	@IsString()
	@IsNotEmpty()
	target: string;
}

export class SpectateGameDto {
	@IsString()
	@IsNotEmpty()
	nick: string;
}

export class RejectGameDto {
	@IsString()
	from: string;
}