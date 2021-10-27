import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class FriendDto1{
  // @ApiProperty({
	// 	example: 'jinbkim',
	// 	description: '내 유저 아이디',
	// })
	// public user_id: string;

	// @ApiProperty({
	// 	example: 'donglee',
	// 	description: '친구 유저 아이디',
	// })
	// public friend_id: string;
	// @ApiProperty({
	// 	example: 'jinbkim',
	// 	description: '내 유저 닉네임',
	// })
	// public user_nick: string;

	@ApiProperty({
		example: 'donglee',
		description: '친구 유저 닉네임',
	})
	@IsString()
	@IsNotEmpty()
	public friend_nick: string;
}

// export class FriendDto2{
//   @ApiProperty({
// 		example: `['jinbkim', 'donglee', 'yochoi' ]`,
// 		description: '유저 아이디 배열',
// 	})
// 	public friends: string[];
// }