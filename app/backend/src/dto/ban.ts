import { ApiProperty } from "@nestjs/swagger";

export class BanDto1{
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

export class BanDto2{
  @ApiProperty({
		example: `[jinbkim, donglee]`,
		description: '유저아이디 배열',
	})
	public user_ids: string[];
}

export class BanDto3{
	@ApiProperty({
		example: 1,
		description: '채널 아이디',
	})
	public channel_id: number;
}

export class BanDto4{
  @ApiProperty({
		example: 'jinbkim',
		description: '유저 아이디',
	})
	public user_id: string;
}