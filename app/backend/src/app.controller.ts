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

  @Post('oauth')
  oauth_post(@Body() data) {
    return data.code;
  }

  @Get('oauth')
  oauth() {
    const client = new Client({
      user: 'pong_admin',
      host: 'db',
      database: 'pong_db',
      password: '1234',
      port: 5432,
    });

    client.connect();

    client.query('SELECT NOW()', (err, res) => {
      console.log(err, res)
      client.end()
    })
  }
}
