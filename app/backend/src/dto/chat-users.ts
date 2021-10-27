import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString } from "class-validator";

export class ChatUsersDto1{
  // @ApiProperty({
	// 	example: 'jinbkim',
	// 	description: '유저 아이디',
	// })
	// public user_id: string;
	// @ApiProperty({
	// 	example: 'jinbkim',
	// 	description: '유저 닉네임',
	// })
	// public nick: string;

	@ApiProperty({
		example: 1,
		description: '채널 아이디',
	})
	@IsNumberString()
	@IsNotEmpty()
	public channel_id: number;
}