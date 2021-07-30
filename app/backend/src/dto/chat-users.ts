import { ApiProperty } from "@nestjs/swagger";

export class ChatUsersDto1{
  @ApiProperty({
		example: 'jinbkim',
		description: '유저 아이디',
	})
	public user_id: string;

	@ApiProperty({
		example: 1,
		description: '채널 아이디',
	})
	public channel_id: number;
}

export class ChatUsersDto2{
	@ApiProperty({
		example: 1,
		description: '채널 아이디',
	})
	public channel_id: number;
}

export class ChatUsersDto3{
	@ApiProperty({
		example: `['jinbkim', 'donglee', 'yochoi']`,
		description: '해당 채널에 있는 유저 아이디 배열',
	})
	public user_ids: string[];
}