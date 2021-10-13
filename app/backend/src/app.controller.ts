import { Controller, Get, Body, Post, Res, Req, Param, Query, Delete } from '@nestjs/common';
import { AppService } from './app.service';
import { LoginCodeDto } from './dto/login-token-dto';
import { Request, Response } from 'express';
import { Cookie } from 'cookiejar';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  
}
