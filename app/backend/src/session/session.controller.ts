import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginCodeDto } from 'src/dto/login-token-dto';
import { SessionService } from './session.service';
import { Request, Response } from 'express';

@ApiTags('Session')
@Controller('session')
export class SessionController {
  constructor(private sessionService: SessionService){}

  @ApiOperation({ summary: '로그인' })
  @Post("/oauth")
  public async get42UserInfo(@Body() loginCodeDto: LoginCodeDto, @Req() request: Request ,@Res({ passthrough: true }) response: Response) {
    try {
      console.log("post inside");
      await this.sessionService.login(loginCodeDto, request, response);
    } catch (err){
      console.log("get42UserInfo Err: ", err);
    }
  }

  @ApiOperation({ summary: '입력받은 세션 ID와 토큰이 유효한지 체크해서 Body에 결과를 담는다' })
  @Get("/valid")
  isValidSession(@Req() request: Request, @Res() response: Response) {
    return this.sessionService.sessionValidCheck(request.sessionID, response);
  }
}
