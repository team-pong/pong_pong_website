import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsNumber, IsNumberString, IsString } from "class-validator";

export class ChatDto1{
	@ApiProperty({
		example: '아무나 와보던가',
		description: '방 제목',
	})
	@IsString()
	@IsNotEmpty()
	public title: string;

  @ApiProperty({
		example: 'public',
		description: '방 타입',
	})
	@IsString()
	@IsNotEmpty()
	public type: string;

  @ApiProperty({
		example: '1234',
		description: '방 비밀번호',
	})
	@IsString()
	public passwd: string;

  @ApiProperty({
		example: 10,
		description: '채널 최대인원',
	})
	@IsNumber()
	@IsNotEmpty()
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

export class ChatDto4 extends ChatDto1{
	@ApiProperty({
		example: 1,
		description: '채널 아이디',
	})
	@IsNumber()
	@IsNotEmpty()
	public channel_id: number;
}

export class ChatDto5{
	@ApiProperty({
		example: 1,
		description: '채널 아이디',
	})
	@IsNumber()
	@IsNotEmpty()
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
	@IsString()
	@IsNotEmpty()
	public owner_nick: string;
}

export class ChatDto6{
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

	@ApiProperty({
		example: 3,
		description: '채널 현재인원',
	})
	public current_people: number;

	@ApiProperty({
		example: 'jinbkim',
		description: 'owner 유저 닉네임',
	})
	public owner_nick: string;

	@ApiProperty({
		example: 1,
		description: '채널 아이디',
	})
	public channel_id: number;
}

export class ReadChatTitleDto {
	@ApiProperty({
		example: 1,
		description: '채널 아이디',
	})
	@IsString()
	@IsNotEmpty()
	public title: string;
}

export class ReadOneChatDto {
	@ApiProperty({
		example: 1,
		description: '채널 아이디',
	})
	@IsNumberString()
	@IsNotEmpty()
	public channel_id: number;
}

export class ReadOwnerDto extends ReadOneChatDto {}

export class CheckChatPasswordDto extends ReadOneChatDto {
	@ApiProperty({
		example: 'qwerty',
		description: '비밀번호',
	})
	@IsString()
	@IsNotEmpty()
	public passwd: string;
}

export class SetChatAdminDto{
	@ApiProperty({
		example: 'hna',
		description: '유저 아이디',
	})
	@IsString()
	@IsNotEmpty()
	public nickname: string;
}

export class DeleteChatAdminDto extends SetChatAdminDto {}

export class SetChatBanDto extends SetChatAdminDto {}

export class SetChatMuteDto extends SetChatAdminDto {}

export class DeleteChatMuteDto extends SetChatMuteDto {}

export class JoinChatDto {
	@ApiProperty({
		example: 1,
		description: '채널 id',
	})
	@IsNotEmpty()
	room_id: string
}

export class SendChatMessageDto {
	@IsString()
	msg: string;
}

export class SetChatRoomInfoDto {
	@IsString()
	title: string;

	@IsIn(['public', 'protected', 'private'])
	type: string;

	@IsNumber()
	current_people: number;

	@IsNumber()
	max_people: number;

	@IsString()
	passwd: string;

	@IsNumber()
	channel_id: number;
}

// export class ChatDto6{
//   @ApiProperty({
// 		example: 'jinbkim',
// 		description: 'owner 유저 아이디',
// 	})
// 	public owner_id: string;
// }