import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsBooleanString, IsNotEmpty, IsString } from "class-validator";

export class SessionDto1{
  @ApiProperty({
		example: 'jinbkim',
		description: '유저 아이디',
	})
	public user_id: string;
}

export class ReadUserWithSessionDto {
	@ApiProperty({
		description: '세션 아이디',
	})
	@IsString()
	@IsNotEmpty()
	public sid: string;
}

export class UpdateMultiFactorLoginDto {
	@ApiProperty({
		example: true,
		description: '2차 인증 방법중 email 사용 여부'
	})
	@IsBoolean()
	@IsNotEmpty()
	public email: boolean;
}

export class LoginWithEmailCodeDto {
	@ApiProperty({
		example: 'asdf',
		description: '전달받은 이메일 인증 코드'
	})
	@IsString()
	@IsNotEmpty()
	public code: string;
}