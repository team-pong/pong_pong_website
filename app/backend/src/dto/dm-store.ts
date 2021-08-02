import { ApiProperty } from "@nestjs/swagger";

export class DmStoreDto1{
  @ApiProperty({
		example: 'jinbkim',
		description: 'dm 보낸 유저 아이디',
	})
	public sender_id: string;

	@ApiProperty({
		example: 'donglee',
		description: 'dm 받은 유저 아이디',
	})
	public receiver_id: string;

  @ApiProperty({
		example: '안뇽~',
		description: 'dm 내용',
	})
	public content: string;
}

export class DmStoreDto2{
  @ApiProperty({
		example: 'jinbkim',
		description: 'dm 보낸 유저 아이디',
	})
	public sender_id: string;

	@ApiProperty({
		example: 'donglee',
		description: 'dm 받은 유저 아이디',
	})
	public receiver_id: string;

  @ApiProperty({
		example: '안뇽~',
		description: 'dm 내용',
	})
	public content: string;

  @ApiProperty({
		example: '2021-07-31T05:41:48.342Z',
		description: 'dm 보낸 시간',
	})
	public createdAt: Date;
}

export class DmStoreDto3{
  @ApiProperty({
		example: 'jinbkim',
		description: 'DM 로그 검색할 유저 아이디',
	})
	public user_id: string;

	@ApiProperty({
		example: 'donglee',
		description: 'DM 로그 검색할 상대 아이디',
	})
	public other_id: string;
}

export class DmStoreDto4{
	@ApiProperty({
		example: ` [
      {
          "sender_id": "jinbkim",
          "receiver_id": "donglee",
          "content": "님아 머해?",
          "createdAt": "2021-07-31T11:46:42.213Z"
      },
      {
          "sender_id": "jinbkim",
          "receiver_id": "donglee",
          "content": "안녕",
          "createdAt": "2021-07-31T11:44:45.749Z"
      },
      {
          "sender_id": "donglee",
          "receiver_id": "jinbkim",
          "content": "나도 안녕",
          "createdAt": "2021-07-31T11:44:45.749Z"
      }
  ]`,
		description: 'DM 보낸 유저 아이디, 받은 유저 아이디, 내용, 보낸 시간 데이터들의 배열',
	})
	public dmList: DmStoreDto2[];
}

export class DmStoreDto5{
  @ApiProperty({
		example: 'jinbkim',
		description: '유저 아이디',
	})
	public user_id: string;
}