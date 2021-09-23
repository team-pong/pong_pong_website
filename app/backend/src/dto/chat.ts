import { ApiProperty } from "@nestjs/swagger";

export class ChatDto1{
	@ApiProperty({
		example: '아무나 와보던가',
		description: '방 제목',
	})
	public title: string;

  @ApiProperty({
		example: 'public',
		description: '방 타입',
	})
	public type: string;

  @ApiProperty({
		example: '1234',
		description: '방 비밀번호',
	})
	public passwd: string;

  @ApiProperty({
		example: 10,
		description: '채널 최대인원',
	})
	public max_people: number;
}

export class ChatDto2{
  @ApiProperty({
		example: '아무나 와보던가',
		description: '방 제목',
	})
	public title: string;

  @ApiProperty({
		example: 'public',
		description: '방 타입',
	})
	public type: string;

	@ApiProperty({
		example: 3,
		description: '채널 현재인원',
	})
	public current_people: number;

  @ApiProperty({
		example: 10,
		description: '채널 최대인원',
	})
	public max_people: number;

	@ApiProperty({
		example: 1,
		description: '채널 아이디',
	})
	public channel_id: number;
}

export class ChatDto3{
  @ApiProperty({
		example: `[
			{
				"title": "아무나",
				"type": "public",
				"current_people": 3,
				"max_people": 10,
				"channel_id": 1
			},
			{
				"title": "아무나 와보렴",
				"type": "protected",
				"current_people": 2,
				"max_people": 5,
				"channel_id": 2
			}
		]`,
		description: '채널 리스트',
	})
  public chatList: ChatDto2[];
}

export class ChatDto4{
	@ApiProperty({
		example: 1,
		description: '채널 아이디',
	})
	public channel_id: number;

	@ApiProperty({
		example: '아무나 와보던가',
		description: '방 제목',
	})
	public title: string;

  @ApiProperty({
		example: 'public',
		description: '방 타입',
	})
	public type: string;

  @ApiProperty({
		example: '1234',
		description: '방 비밀번호',
	})
	public passwd: string;

  @ApiProperty({
		example: 10,
		description: '채널 최대인원',
	})
	public max_people: number;
}

export class ChatDto5{
	@ApiProperty({
		example: 1,
		description: '채널 아이디',
	})
	public channel_id: number;

  // @ApiProperty({
	// 	example: 'jinbkim',
	// 	description: 'owner 유저 아이디',
	// })
	// public owner_id: string;
	@ApiProperty({
		example: 'jinbkim',
		description: 'owner 유저 닉네임',
	})
	public owner_nick: string;
}

// export class ChatDto6{
//   @ApiProperty({
// 		example: 'jinbkim',
// 		description: 'owner 유저 아이디',
// 	})
// 	public owner_id: string;
// }