import { ApiProperty } from "@nestjs/swagger";

export class SessionDto1{
  @ApiProperty({
		example: 'jinbkim',
		description: '유저 아이디',
	})
	public user_id: string;
}
