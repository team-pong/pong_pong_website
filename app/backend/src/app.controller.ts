import { Controller, Get, Body, Post, Res, Req, Param, Query, Delete } from '@nestjs/common';
import { AppService } from './app.service';
import { LoginCodeDto } from './dto/login-token-dto';
import { Request, Response } from 'express';
import { Cookie } from 'cookiejar';

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

  @Get("/auth/valid")
  isValidSession(@Req() request: Request, @Res() response: Response) {
    return this.appService.sessionValidCheck(request.sessionID, response);
  }

  @Get("cookie")
  cookie(@Res({ passthrough: true }) response: Response) {
    response.cookie('key_test', 'value_test');
    return ('hi');
  }

  // request.headers['set-cookie'][0] : 'sessionID=8zTfJcpx3_FEyv0BEKlr99vGy1A6VN92; Path=/; HttpOnly; Secure; SameSite=None' 
  // request.headers['set-cookie'][0].split(";")[0] : 'sessionID=8zTfJcpx3_FEyv0BEKlr99vGy1A6VN92
  // request.headers['set-cookie'][0].split(";")[0].split("=")[1] : 8zTfJcpx3_FEyv0BEKlr99vGy1A6VN92
  @Get('/users/info')
  fetchUser(@Req() request: Request) {
    return this.appService.fetchUser(request.sessionID);
  }

  
  @Post('/users/info')
  updateUser(@Body() userData) {
    this.appService.updateUser(userData);
  }

  @Delete('/users/info')
  deleteUser(@Req() request: Request) {
    return this.appService.deleteUser(request.headers['set-cookie'][0].split(";")[0].split("=")[1]);
  }
}
