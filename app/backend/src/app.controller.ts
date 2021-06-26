import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { LoginCodeDto } from './dto/login-token-dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post("/api/oauth/")
  public async get42UserInfo(@Body() loginCodeDto: LoginCodeDto) {
    const user = await this.appService.getUserInfo(loginCodeDto);
    return {
      status: 200,
      message: '유저 정보 조회 완료',
      data: {
        user,
      },
    };
  }
}
