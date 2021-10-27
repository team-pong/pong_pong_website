import { IsNotEmpty, IsString } from "class-validator";

export class GlobalSendDmDto {
	@IsString()
	@IsNotEmpty()
	to: string;

	@IsString()
	msg: string;
}