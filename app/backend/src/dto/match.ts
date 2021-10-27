import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class MatchDto1{
  // @ApiProperty({
	// 	example: 'jinbkim',
	// 	description: '승자 아이디',
	// })
	// public winner_id: string;

	// @ApiProperty({
	// 	example: 'donglee',
	// 	description: '패자 아이디',
	// })
	// public loser_id: string;
	@ApiProperty({
		example: 'jinbkim',
		description: '승자 닉네임',
	})
	public winner_nick: string;

	@ApiProperty({
		example: 'donglee',
		description: '패자 닉네임',
	})
	public loser_nick: string;

  @ApiProperty({
		example: 3,
		description: '승자 점수',
	})
	public winner_score: number;

  @ApiProperty({
		example: 3,
		description: '패자 점수',
	})
	public loser_score: number;

  @ApiProperty({
		example: 'general',
		description: '게임 타입',
	})
	public type: string;

	@ApiProperty({
		example: 1,
		description: '맵 정보',
	})
	public map: number;
}

export class MatchDto2{
  @ApiProperty({
		example: 'https://gravatar.com/avatar/d93441b9901723e7ec67159e63c4f995?s=400&d=robohash&r=x',
		description: '유저 아바타 url',
	})
	public user_url: string;

	@ApiProperty({
		example: 'jinbkim',
		description: '유저 닉네임',
	})
	public user_nick: string;

  @ApiProperty({
		example: 3,
		description: '유저 점수',
	})
	public user_score: number;

  @ApiProperty({
		example: 'https://gravatar.com/avatar/25cf6248db6870d21eb8b71e7559d613?s=400&d=robohash&r=x',
		description: '상대 아바타 url',
	})
	public other_url: string;

	@ApiProperty({
		example: 'donglee',
		description: '상대 닉네임',
	})
	public other_nick: string;

  @ApiProperty({
		example: 1,
		description: '상대 점수',
	})
	public other_score: number;

	@ApiProperty({
		example: '2021-07-31T05:41:48.342Z',
		description: '게임 시간',
	})
	public created_at: Date;

  @ApiProperty({
		example: 'general',
		description: '게임 타입',
	})
	public type: string;

	@ApiProperty({
		example: 1,
		description: '맵 정보',
	})
	public map: number;

	@ApiProperty({
		example: 'true',
		description: '승패여부: 승이면 true, 패면 false',
	})
	public isWin: boolean;
}

export class MatchDto3{
	@ApiProperty({
		example: `[
			{
					"user_score": 3,
					"other_score": 1,
					"isWin": true,
					"user_url": "a",
					"user_nick": "jinbkim",
					"other_url": "b",
					"other_nick": "donglee",
					"createdAt": "2021-07-31T05:41:48.342Z",
					"type": "general",
					"map": 1
			},
			{
					"user_score": 0,
					"other_score": 2,
					"isWin": false,
					"user_url": "a",
					"user_nick": "jinbkim",
					"other_url": "b",
					"other_nick": "donglee",
					"createdAt": "2021-07-31T05:41:48.342Z",
					"type": "general",
					"map": 3
			}
	]`,
		description: '유저(아바타, nickname, 점수), 상대(아바타, nickname, 점수), 시간, 게임종류, 맵정보, 승패여부 데이터를 담은 배열',
	})
	public matchList: MatchDto2[];
}

export class MatchDto4{
	@ApiProperty({
		example: 'jinbkim',
		description: '유저 닉네임',
	})
	public nick: string;

  @ApiProperty({
		example: 'https://gravatar.com/avatar/d93441b9901723e7ec67159e63c4f995?s=400&d=robohash&r=x',
		description: '아바타 이미지 url',
	})
	public avatar_url: string;

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
}

export class MatchDto5{
	@ApiProperty({
		example: ``,
		description: '유저 닉네임, 아바타 이미지 url, 이긴 게임수, 진게임수 래더 점수 데이터를 담은 배열',
	})
	public rankList: MatchDto4[];
}

export class ReadMatchDto {
	@ApiProperty({
		example: `yochoi`,
		description: '유저 닉네임',
	})
	@IsString()
	@IsNotEmpty()
	public nick: string;
}