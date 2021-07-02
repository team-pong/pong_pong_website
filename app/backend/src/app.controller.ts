import { Controller, Get, Body, Post, Res, Req, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { LoginCodeDto } from './dto/login-token-dto';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post("/api/oauth/")
  public async get42UserInfo(@Body() loginCodeDto: LoginCodeDto, @Req() request: Request ,@Res({ passthrough: true }) response: Response) {
    console.log("post inside");
    const user = await this.appService.login(loginCodeDto, request);
    response.cookie('sessionID', request.sessionID, {
      sameSite: 'none',
      httpOnly: true,
      secure: true
    });
    console.log("before response send");
    response.send();
    console.log("after response send");
  }

  @Get("cookie")
  cookie(@Res({ passthrough: true }) response: Response) {
    response.cookie('key_test', 'value_test');
    response.send("cookie send");
    return ('hi');
  }

  @Get('/info/')
  getUser(@Query('user_id') id: string){
    return this.appService.getUser(id);
  }
}
