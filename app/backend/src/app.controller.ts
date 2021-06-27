import { Controller, Get, Body, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Client } from 'pg';
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
    console.log("post inside");
    const user = await this.appService.getUserInfo(loginCodeDto);
  }
}
