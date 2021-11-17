import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class GlobalSendDmDto {
	@IsString()
	@IsNotEmpty()
	to: string;

	@IsString()
	msg: string;
}

export class InviteChatDto {
	@IsString()
	from: string;

	@IsString()
	target: string;

	@IsString()
	chatTitle: string;

	@IsNumber()
	channelId: number;
}

export class InviteGameDto {
	@IsString()
	from: string;

	@IsString()
	target: string;

	@IsString()
	gameMap: string;
}