import { Controller, Get, Body, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Client } from 'pg';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
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
