import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class UsersDto1{
  @ApiProperty({
		example: 'jinbkim',
		description: '유저 아이디',
	})
	public user_id: string;

	@ApiProperty({
		example: '인생조져따',
		description: '유저 닉네임',
	})
	public nick: string;

  @ApiProperty({
		example: 'https://gravatar.com/avatar/d93441b9901723e7ec67159e63c4f995?s=400&d=robohash&r=x',
		description: '아바타 이미지 url',
	})
	public avatar_url: string;
}

export class UsersDto2{
  @ApiProperty({
		example: 'jinbkim',
		description: '유저 아이디',
	})
  
	public user_id: string;
	@ApiProperty({
		example: '인생조져따',
		description: '유저 닉네임',
	})
	public nick: string;

  @ApiProperty({
		example: 'https://gravatar.com/avatar/d93441b9901723e7ec67159e63c4f995?s=400&d=robohash&r=x',
		description: '아바타 이미지 url',
	})
	public avatar_url: string;
}

export class UsersDto3{
  @ApiProperty({
		example: 'jinbkim',
		description: '유저 아이디',
	})
	public user_id: string;

	@ApiProperty({
		example: '인생조져따',
		description: '유저 닉네임',
	})
	public nick: string;

  @ApiProperty({
		example: 'https://gravatar.com/avatar/d93441b9901723e7ec67159e63c4f995?s=400&d=robohash&r=x',
		description: '아바타 이미지 url',
	})
	public avatar_url: string;

  @ApiProperty({
		example: 10,
		description: '총 게임수',
	})
	public total_games: number;

  @ApiProperty({
		example: 6,
		description: '이긴 게임수',
	})
	public win_games: number;

  @ApiProperty({
		example: 4,
		description: '진 게임수',
	})
	public loss_games: number;

  @ApiProperty({
		example: 1200,
		description: '래더 점수',
	})
	public ladder_level: number;

  @ApiProperty({
		example: 'game',
		description: '유저의 상태',
	})
	public status: string;

  @ApiProperty({
		example: 'game',
		description: '유저의 상태',
	})
	@IsBoolean()
	@IsNotEmpty()
	public admin: boolean;
}

export class UsersDto4{
  // @ApiProperty({
	// 	example: 'jinbkim',
	// 	description: '유저 아이디',
	// })
	// public user_id: string;
	@ApiProperty({
		example: 'jinbkim',
		description: '유저 닉네임',
	})
	public nick: string;

  @ApiProperty({
		example: 'game',
		description: '유저의 상태',
	})
	public status: string;
}

export class UsersDto5{
	@ApiProperty({
		example: `[
			{
				"user_id": "hna",
				"nick": "hna",
				"avatar_url": "https://gravatar.com/avatar/d93441b9901723e7ec6159e63c4f993?s=400&d=robohash&r=x",
				"total_games": 0,
				"win_games": 0,
				"loss_games": 0,
				"ladder_level": 1000,
				"status": "on"
			},
			{
				"user_id": "jinwkim",
				"nick": "jinwkim",
				"avatar_url": "https://gravatar.com/avatar/d93441b991723e7ec67159e63c4f995?s=400&d=robohash&r=x",
				"total_games": 0,
				"win_games": 0,
				"loss_games": 0,
				"ladder_level": 1000,
				"status": "on"
			}
		]`,
		description: '유저객체 배열',
	})
	public users_arr: UsersDto3[];
}