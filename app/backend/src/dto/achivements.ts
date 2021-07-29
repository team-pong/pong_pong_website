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
		example: `['난무조건이겨', '타락파워전사']`,
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