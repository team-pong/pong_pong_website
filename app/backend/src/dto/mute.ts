import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, IsString } from "class-validator";

export class MuteDto1{
  // @ApiProperty({
	// 	example: 'yochoi',
	// 	description: '유저 아이디',
	// })
	// public user_id: string;
	@ApiProperty({
		example: 'yochoi',
		description: '유저 닉네임',
	})
	@IsString()
	@IsNotEmpty()
	public nick: string;

	@ApiProperty({
		example: 1,
		description: '채널 아이디',
	})
	@IsNumberString()
	@IsNotEmpty()
	public channel_id: number;
}