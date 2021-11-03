import { Controller, Get, Body, Post, Res, Req, Param, Query, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AppService } from './app.service';
import { LoginCodeDto } from './dto/login-token-dto';
import { Request, Response } from 'express';
import { Cookie } from 'cookiejar';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
}
