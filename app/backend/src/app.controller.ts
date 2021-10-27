import { Controller, Get, Body, Post, Res, Req, Param, Query, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AppService } from './app.service';
import { LoginCodeDto } from './dto/login-token-dto';
import { Request, Response } from 'express';
import { Cookie } from 'cookiejar';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';


export const randomFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(4).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './files',
      filename: randomFileName,
    }),
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    const response = {
      originalname: file.originalname,
      filename: file.filename,
      path: file.path
    }
    console.log(file);
    return response;
  }
}
