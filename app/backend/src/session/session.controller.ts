import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginCodeDto } from 'src/dto/login-token-dto';
import { SessionService } from './session.service';
import { Request, Response } from 'express';
import { LoginWithEmailCodeDto, ReadUserWithSessionDto, SessionDto1, UpdateMultiFactorLoginDto } from 'src/dto/session';
import { NotLoggedInGuard } from 'src/auth/not-logged-in.guard';
import { LoggedInGuard } from 'src/auth/logged-in.guard';

function isNotTestUser(user_id: string) {
	if (user_id.indexOf("tester") == -1) {
		return true;
	} else {
		return false;
	}
}

@ApiTags('Session')
@Controller('session')
export class SessionController {
  constructor(private sessionService: SessionService){}

	/*
	* @brief 소켓 통신용 테스트 유저로 로그인하는 api
	* @todo production 환경에서 삭제되어야함
	*/
	// @ApiOperation({ summary: '개발용 테스트유저1 로 로그인' })
	// @Get("/test_user01")
	// async tester_login01(@Res({ passthrough: true }) response: Response, @Req() request: Request) {
	// 	await this.sessionService.tester_login(request, 'tester01', 'tester01', 'https://gravatar.com/avatar/sdfdw332?s=400&d=robohash&r=x');
	// 	return response.redirect(`${process.env.BACKEND_SERVER_URL}/mainpage`)
	// }

	/*!
	 * @brief 소켓 통신용 테스트 유저로 로그인하는 api
	 * @todo production 환경에서 삭제되어야함
	 */
	// @ApiOperation({ summary: '개발용 테스트유저2 로 로그인' })
	// @Get("/test_user02")
	// async tester_login02(@Res({ passthrough: true }) response: Response, @Req() request: Request) {
	// 	await this.sessionService.tester_login(request, 'tester02', 'tester02', 'https://gravatar.com/avatar/ppgw8831?s=400&d=robohash&r=x');
	// 	return response.redirect(`${process.env.BACKEND_SERVER_URL}/mainpage`)
	// }

	/*!
	 * @brief 소켓 통신용 테스트 유저로 로그인하는 api
	 * @todo production 환경에서 삭제되어야함
	 */
	// @ApiOperation({ summary: '개발용 테스트유저2 로 로그인' })
	// @Get("/test_user03")
	// async tester_login03(@Res({ passthrough: true }) response: Response, @Req() request: Request) {
	// 	await this.sessionService.tester_login(request, 'tester03', 'tester03', 'https://gravatar.com/avatar/ppgw8831?s=400&d=robohash&r=x');
	// 	return response.redirect(`${process.env.BACKEND_SERVER_URL}/mainpage`)
	// }

	/*!
	 * @brief 소켓 통신용 테스트 유저로 로그인하는 api
	 * @todo production 환경에서 삭제되어야함
	 */
	// @ApiOperation({ summary: '개발용 테스트유저2 로 로그인' })
	// @Get("/test_user04")
	// async tester_login04(@Res({ passthrough: true }) response: Response, @Req() request: Request) {
	// 	await this.sessionService.tester_login(request, 'tester04', 'tester04', 'https://gravatar.com/avatar/ppgw8831?s=400&d=robohash&r=x');
	// 	return response.redirect(`${process.env.BACKEND_SERVER_URL}/mainpage`)
	// }

	@Get("/login")
	async login(@Req() req: Request, @Res() res: Response) {
		//console.log("GET /login id:", req.session.userid, "| loggedIn:", req.session.loggedIn)
		if (req.session.loggedIn == true && isNotTestUser(req.session.userid)) { // 이미 로그인 되어있는 유저라면
			// 바로 로그인 (쿠키에 남아있는 세션이 이미 검증되었으면 다시 로그인 검사를 할 필요가 없으니까)
			return res.redirect(`${process.env.BACKEND_SERVER_URL}/mainpage`)
		} else {
			// 42api로 리디렉트
    const login_api_url = `https://api.intra.42.fr/oauth/authorize`
			+ `?client_id=${process.env.CLIENT_ID}`
			+ `&redirect_uri=http%3A%2F%2F127.0.0.1%2Fsession%2Foauth`
			+ `&response_type=code`;
			return res.redirect(login_api_url);
		}
	}

	@ApiOperation({ summary: '세션 쿠키를 지우고 로그인 화면으로 리디렉트'})
	@Get("/logout")
	async logout(@Res() res: Response) {
		res.clearCookie('connect.sid');
		res.redirect(`${process.env.BACKEND_SERVER_URL}/`);
	}

  @ApiOperation({ summary: '42로그인 페이지에서 이 주소로 코드를 전송'})
  @Get("/oauth")
  async loginRedirectFor42Api(@Query() loginCodeDto: LoginCodeDto, @Req() request: Request ,@Res({ passthrough: true }) response: Response) {
    try {
      if (LoginCodeDto) {
				return await this.sessionService.login(loginCodeDto, request, response);
			}
    } catch (err){
      //console.log("get42UserInfo Err: ", err);
    }
  }

  @ApiOperation({ summary: '세션 아이디로 유저아이디 검색'})
  @ApiResponse({ type: SessionDto1, description: '유저 아이디' })
  @ApiQuery({ name: 'sid', example: '0TBeNj59PUBZ_XjbXGKq9sHHPHCkZky4', description: '세션아이디' })
  @Get("/user_id")
  readUser(@Query() q: ReadUserWithSessionDto){
    return this.sessionService.readUser(q.sid);
  }

	@Get('/twoFactor')
	getMultiFactorAuthInfo(@Req() req: Request) {
		return this.sessionService.getMultiFactorAuthInfo(req.session.userid);
	}

	@Post('/twoFactor')
	updateFactorAuth(@Req() req: Request, @Body() body: UpdateMultiFactorLoginDto) {
		this.sessionService.updateMultiFactorAuthInfo(req.session.userid, body.email);
		return ({});
	}

	@Get('/emailCode')
	async loginWithEmailCode(@Req() req: Request, @Query() query: LoginWithEmailCodeDto, @Res() res: Response) {
		//console.log("GET emailCode", req.session.userid, query.code);
		if (await this.sessionService.isValidCode(req.session.userid, query.code)) {
			req.session.loggedIn = true;
			return res.redirect(`${process.env.BACKEND_SERVER_URL}/mainpage`);
		} else {
			return res.redirect(`${process.env.BACKEND_SERVER_URL}/?twoFactor=email`)
		}
	}
}
