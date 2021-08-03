import { ApiProperty } from "@nestjs/swagger";

export class ErrMsgDto{
  constructor(err_msg: string){
    this.err_msg = err_msg;
  }
  @ApiProperty({
		example: 'The user does not exist',
		description: '에러 메시지',
	})
	public err_msg: string;
}

export class Bool{
  constructor(bool: boolean){
    this.bool = bool;
  }
  @ApiProperty({
		example: 'true',
		description: 'true or false',
	})
	public bool: boolean;
}