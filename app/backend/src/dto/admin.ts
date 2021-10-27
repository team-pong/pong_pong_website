import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class AdminDto1{
  // @ApiProperty({
	// 	example: 'jinbkim',
	// 	description: '유저 아이디',
	// })
	// public user_id: string;

	@ApiProperty({
		example: 'jinbkim',
		description: '유저 닉네임',
	})
	@IsString()
	@IsNotEmpty()
	public nick: string;

	@ApiProperty({
		example: 1,
		description: '채널 아이디',
	})
	@IsNumber()
	@IsNotEmpty()
	public channel_id: number;
}

export class GetChannelAdminDto {
	@ApiProperty({
		example: 1,
		description: '채널 아이디',
	})
	@IsNumber()
	@IsNotEmpty()
	public channel_id: number;
}

export class IsChannelAdminDto extends AdminDto1 {}

export class DeleteChannelAdminDto extends AdminDto1 {}

// export class AdminDto2{
//   @ApiProperty({
// 		example: `[jinbkim, donglee]`,
// 		description: '유저아이디 배열',
// 	})
// 	public admins: string[];
// }