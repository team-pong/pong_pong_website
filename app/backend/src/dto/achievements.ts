import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

// export class AcievementDto1{
// 	@ApiProperty({
// 		example: 'jinbkim',
// 		description: '유저 아이디',
// 	})
// 	public user_id: string;

// 	@ApiProperty({
// 		example: '난무조건이겨',
// 		description: '칭호',
// 	})
// 	public achievement: string;
// }

export class GetAchievementDto {
	@ApiProperty({
		example: `hna`
	, description: `유저 ID`})
	@IsString()
	@IsNotEmpty()
	user_id: string;
}

export class DeleteAllAchievementsDto extends GetAchievementDto {}

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