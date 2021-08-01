import { ApiProperty } from "@nestjs/swagger";

export class BlockDto1{
  @ApiProperty({
		example: 'jinbkim',
		description: '내 유저 아이디',
	})
	public user_id: string;

	@ApiProperty({
		example: 'donglee',
		description: '차단 유저 아이디',
	})
	public block_id: string;
}

export class BlockDto2{
  @ApiProperty({
		example: `['jinbkim', 'donglee', 'yochoi' ]`,
		description: '해당 유저의 차단 목록',
	})
	public blocks: string[];
}

export class BlockDto3{
  @ApiProperty({
		example: 'jinbkim',
		description: '내 유저 아이디',
	})
	public user_id: string;
}