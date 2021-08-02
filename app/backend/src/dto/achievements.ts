import { ApiProperty } from "@nestjs/swagger";

export class AcievementDto1{
	@ApiProperty({
		example: 'jinbkim',
		description: '유저 아이디',
	})
	public user_id: string;

	@ApiProperty({
		example: '난무조건이겨',
		description: '칭호',
	})
	public achievement: string;
}

export class AcievementDto2{
	@ApiProperty({
		example: `
		[
			"1 WIN",
			"3 WIN",
			"5 WIN",
			"10 WIN",
			"20 WIN",
			"30 WIN",
			"50 WIN",
			"70 WIN",
			"100 WIN"
	]
		`,
		description: '칭호(문자열) 배열',
	})
	public achievements: string[];
}

export class AcievementDto3{
	@ApiProperty({
		example: 'jinbkim',
		description: '유저 아이디',
	})
	public user_id: string;
}