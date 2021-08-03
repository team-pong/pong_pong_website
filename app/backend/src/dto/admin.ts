import { ApiProperty } from "@nestjs/swagger";

export class AdminDto1{
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

export class AdminDto2{
  @ApiProperty({
		example: `[jinbkim, donglee]`,
		description: '유저아이디 배열',
	})
	public admins: string[];
}