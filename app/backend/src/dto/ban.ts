import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, IsString } from "class-validator";

export class BanDto1{
  // @ApiProperty({
	// 	example: 'jinbkim',
	// 	description: '유저 아이디',
	// })
	// public user_id: string;
	@ApiProperty({
		example: 'jinbkim',
		description: '유저 닉네임',
	})
	@IsString()
	@IsNotEmpty()
	public nick: string;

	@IsNumberString()
	@IsNotEmpty()
	@ApiProperty({
		example: 1,
		description: '채널 아이디',
	})
	public channel_id: number;
}