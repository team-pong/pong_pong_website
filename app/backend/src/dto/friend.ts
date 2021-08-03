import { ApiProperty } from "@nestjs/swagger";

export class FriendDto1{
  @ApiProperty({
		example: 'jinbkim',
		description: '내 유저 아이디',
	})
	public user_id: string;

	@ApiProperty({
		example: 'donglee',
		description: '친구 유저 아이디',
	})
	public friend_id: string;
}

export class FriendDto2{
  @ApiProperty({
		example: `['jinbkim', 'donglee', 'yochoi' ]`,
		description: '유저 아이디 배열',
	})
	public friends: string[];
}