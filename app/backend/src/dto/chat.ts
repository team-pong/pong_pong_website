import { ApiProperty } from "@nestjs/swagger";

export class ChatDto1{
  @ApiProperty({
		example: 'jinbkim',
		description: '방장 유저 아이디',
	})
	public owner_id: string;

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
		example: 10,
		description: '채널 최대인원',
	})
	public max_people: number;
}

export class ChatDto3{
  @ApiProperty({
		example: `{ [ {'title': '아무나', 'type': 'public', 'max_people': 5 }, ]}`,
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

  @ApiProperty({
		example: 'jinbkim',
		description: '방장 유저 아이디',
	})
	public owner_id: string;
}

export class ChatDto6{
	@ApiProperty({
		example: 1,
		description: '채널 아이디',
	})
	public channel_id: number;
}

export class ChatDto7{
  @ApiProperty({
		example: 'jinbkim',
		description: '방장 유저 아이디',
	})
	public owner_id: string;
}

export class ChatDto8{
	@ApiProperty({
		example: '아무나 와보던가',
		description: '검색할 방 제목',
	})
	public title: string;
}