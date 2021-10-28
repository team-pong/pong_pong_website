import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ReadDmStoreDto {
	@ApiProperty({
		example: 'donglee',
		description: 'dm 받은 유저 닉네임',
	})
	@IsString()
	@IsNotEmpty()
	public receiver_nick: string;
}

export class DmStoreDto1 extends ReadDmStoreDto {
  // @ApiProperty({
	// 	example: 'jinbkim',
	// 	description: 'dm 보낸 유저 아이디',
	// })
	// public sender_id: string;

	// @ApiProperty({
	// 	example: 'donglee',
	// 	description: 'dm 받은 유저 아이디',
	// })
	// public receiver_id: string;
	// @ApiProperty({
	// 	example: 'jinbkim',
	// 	description: 'dm 보낸 유저 닉네임',
	// })
	// public sender_nick: string;
  @ApiProperty({
		example: '안뇽~',
		description: 'dm 내용',
	})
	@IsString()
	@IsNotEmpty()
	public content: string;
}

export class DmStoreDto2{
  // @ApiProperty({
	// 	example: 'jinbkim',
	// 	description: 'dm 보낸 유저 아이디',
	// })
	// public sender_id: string;

	// @ApiProperty({
	// 	example: 'donglee',
	// 	description: 'dm 받은 유저 아이디',
	// })
	// public receiver_id: string;
	@ApiProperty({
		example: 'jinbkim',
		description: 'dm 보낸 유저 닉네임',
	})
	public sender_nick: string;

	@ApiProperty({
		example: 'donglee',
		description: 'dm 받은 유저 닉네임',
	})
	public receiver_nick: string;

  @ApiProperty({
		example: '안뇽~',
		description: 'dm 내용',
	})
	public content: string;

  @ApiProperty({
		example: '2021-07-31T05:41:48.342Z',
		description: 'dm 보낸 시간',
	})
	public created_at: Date;
}

export class DmStoreDto3{
	@ApiProperty({
		example: `[
    {
      "sender_id": "jinbkim",
      "receiver_id": "donglee",
      "content": "ㅠㅠ",
      "created_at": "2021-09-03T01:40:59.575Z"
    },
    {
      "sender_id": "jinbkim",
      "receiver_id": "donglee",
      "content": "안녕",
      "created_at": "2021-09-03T01:02:08.420Z"
    },
    {
      "sender_id": "donglee",
      "receiver_id": "jinbkim",
      "content": "나도 안녕",
      "created_at": "2021-09-03T01:02:08.420Z"
    }
  ]`,
		// description: 'DM 보낸 유저 아이디, 받은 유저 아이디, 내용, 보낸 시간 데이터들의 배열',
		description: 'DM 보낸 유저 닉네임, 받은 유저 닉네임, 내용, 보낸 시간 데이터들의 배열',
	})
	public dmList: DmStoreDto2[];
}