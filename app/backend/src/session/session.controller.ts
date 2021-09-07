import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginCodeDto } from 'src/dto/login-token-dto';
import { SessionService } from './session.service';
import { Request, Response } from 'express';
import { SessionDto1 } from 'src/dto/session';

@ApiTags('Session')
@Controller('session')
export class SessionController {
  constructor(private sessionService: SessionService){}

	/*
	* 소켓 통신용 테스트 유저로 로그인하는 api
	* production 환경에서 삭제되어야함
	*/
	@ApiOperation({ summary: '개발용 테스트유저1 로 로그인' })
	@Post("/test_user01")
	async tester_login01(@Res({ passthrough: true }) response: Response, @Req() request: Request) {
		await this.sessionService.tester_login(request, 'tester01', 'test_user_01');
		return response.redirect('http://127.0.0.1:3000/mainpage')
	}

	/*!
	 * 소켓 통신용 테스트 유저로 로그인하는 api
	 * production 환경에서 삭제되어야함
	 */
	@ApiOperation({ summary: '개발용 테스트유저2 로 로그인' })
	@Post("/test_user02")
	async tester_login02(@Res({ passthrough: true }) response: Response, @Req() request: Request) {
		await this.sessionService.tester_login(request, 'tester02', 'test_user_02');
		return response.redirect('http://127.0.0.1:3000/mainpage')
	}


  @ApiOperation({ summary: '42로그인 페이지에서 이 주소로 코드를 전송'})
  @Get("/oauth")
  async login(@Query() loginCodeDto: LoginCodeDto, @Req() request: Request ,@Res({ passthrough: true }) response: Response) {
    try {
      if (LoginCodeDto)
        await this.sessionService.login(loginCodeDto, request, response);
      return response.redirect('http://127.0.0.1:3000/mainpage')
    } catch (err){
      console.log("get42UserInfo Err: ", err);
    }
  }

  @ApiOperation({ summary: '로그인' })
  @Post("/oauth")
  public async get42UserInfo(@Body() loginCodeDto: LoginCodeDto, @Req() request: Request ,@Res({ passthrough: true }) response: Response) {
    return response.redirect('http://127.0.0.1:3000/mainpage')
  }

  @ApiOperation({ summary: '입력받은 세션 ID와 토큰이 유효한지 체크해서 Body에 결과를 담는다' })
  @Get("/valid")
  isValidSession(@Req() request: Request, @Res() response: Response) {
    return this.sessionService.sessionValidCheck(request.sessionID, response);
  }

  @ApiOperation({ summary: '세션 아이디로 유저아이디 검색'})
  @ApiResponse({ type: SessionDto1, description: '유저 아이디' })
  @ApiQuery({ name: 'sid', example: '0TBeNj59PUBZ_XjbXGKq9sHHPHCkZky4', description: '세션아이디' })
  @Get("/user_id")
  readUser(@Query() q){
    return this.sessionService.readUser(q.sid);
  }  
}
