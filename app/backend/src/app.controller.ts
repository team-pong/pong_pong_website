import { Controller, Get, Body, Post, Res, Req, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { LoginCodeDto } from './dto/login-token-dto';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post("/api/oauth/")
  public async get42UserInfo(@Body() loginCodeDto: LoginCodeDto, @Req() request: Request ,@Res({ passthrough: true }) response: Response) {
    try {
      console.log("post inside");
      await this.appService.login(loginCodeDto, request, response);
    } catch (err){
      console.log("get42UserInfo Err: ", err);
    }
  }

  @Get("cookie")
  cookie(@Res({ passthrough: true }) response: Response) {
    response.cookie('key_test', 'value_test');
    // response.send("cookie send");
    return ('hi');
  }

  @Get('/info/')
  getUser(@Query('user_id') id: string){
    return this.appService.getUser(id);
  }
}
