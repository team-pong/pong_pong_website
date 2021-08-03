import { ApiProperty } from "@nestjs/swagger";

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
}