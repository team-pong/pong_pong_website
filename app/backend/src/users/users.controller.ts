import { Body, Controller, Delete, forwardRef, Get, Inject, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReadUserDto, ReadUserWithIdDto, UpdateNickDto, UpdateUserInfoDto, UsersDto1, UsersDto2, UsersDto3, UsersDto4 } from 'src/dto/users';
import { ErrMsgDto } from 'src/dto/utility';
import { UsersService } from './users.service';
import { Request, Response } from 'express';
import { SessionService } from 'src/session/session.service';
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Param } from '@nestjs/common';

export const randomFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(4).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};

@ApiTags('Users')
@Controller('users')
@UseGuards(new LoggedInGuard())
export class UsersController {
  constructor(
    private usersService: UsersService,
    @Inject(forwardRef(() => SessionService))
    private sessionService: SessionService,
  ){}

  // @ApiOperation({ summary: '유저 생성' })
  // @ApiResponse({ type: ErrMsgDto, description: '유저 생성 실패시 실패 이유' })
  // @ApiBody({ type: UsersDto1, description: '유저 아이디, 닉네임, 아바타 url' })
  // @Post()
  // creatUsers(@Body() b: UsersDto1){
  //   return this.usersService.createUsers(b.user_id, b.nick, b.avatar_url, '');
  // }

  @ApiOperation({ summary: '유저 닉네임으로 유저의 프로필 검색'})
  @ApiResponse({ 
    type: UsersDto3, 
    description: `
      유저의 아이디, 닉네임, 아바타 url, 총 게임수, 이긴 게임수, 진 게임수, 래더점수, 유저의 상태
      검색 실패시 실패 이유
    ` })
  @ApiQuery({ name: 'nick', example: 'jinbkim',description: '프로필을 검색할 유저 닉네임' })
  @Get()
  readUsers1(@Query() q: ReadUserDto){
    return this.usersService.readUsers(q.nick, 'nick');
  }

  @ApiOperation({ summary: '유저 아이디로 유저의 프로필 검색'})
  @ApiResponse({ 
    type: UsersDto3, 
    description: `
      유저의 아이디, 닉네임, 아바타 url, 총 게임수, 이긴 게임수, 진 게임수, 래더점수, 유저의 상태
      검색 실패시 실패 이유
    ` })
  @ApiQuery({ name: 'user_id', example: 'jinbkim', description: '프로필을 검색할 유저 아이디' })
  @Get('user')
  readUsers2(@Query() q: ReadUserWithIdDto){
    return this.usersService.readUsers(q.user_id, 'user_id');
  }

  @ApiOperation({ summary: '유저 정보 변경'})
  @ApiResponse({ type: ErrMsgDto, description: '유저 정보 변경 실패시 실패 이유' })
  @ApiBody({ type: UsersDto2, description: '변경할 유저 아이디, 유저 닉네임, 아바타 이미지 url' })
  @Post('info')
  async updateUsers(@Req() req: Request, @Body() body: UpdateUserInfoDto){
    const user_info = await this.usersService.getUserInfo(req.session.userid);
    return this.usersService.updateUsers(user_info.user_id, body.nick, body.avatar_url);
  }

  @ApiOperation({ summary: '닉네임 변경'})
  @ApiResponse({ type: ErrMsgDto, description: '닉네임 변경 실패시 실패 이유' })
  @ApiBody({ type: UpdateNickDto, description: '변경할 닉네임' })
  @Post('nick')
  async updateNickname(@Req() req: Request, @Body() body: UpdateNickDto){
    const user_info = await this.usersService.getUserInfo(req.session.userid);
    // 닉네임 중복 검사는 아래 함수 안에서 진행한다.
    return this.usersService.updateUsers(user_info.user_id, body.nick, user_info.avatar_url);
  }

  @ApiOperation({ summary: '아바타 사진 조회'})
  @ApiResponse({ type: ErrMsgDto, description: '유저 정보 변경 실패시 실패 이유' })
  @ApiBody({ type: UsersDto2, description: '변경할 유저 아이디, 유저 닉네임, 아바타 이미지 url' })
  @Get('avatar/:imgpath')
  seeUploadedFile(@Param('imgpath') image: string, @Res() res: Response) {
    try {
      return res.sendFile(image, { root: './avatars' });
    } catch (err) {
      return err;
    }
  }
  

  @ApiOperation({ summary: '아바타 사진 변경'})
  @ApiResponse({ type: ErrMsgDto, description: '유저 정보 변경 실패시 실패 이유' })
  @ApiBody({ type: UsersDto2, description: '변경할 유저 아이디, 유저 닉네임, 아바타 이미지 url' })
  @Post('avatar')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './avatars',
      filename: randomFileName,
    }),
  }))
  async uploadAvatar(@Req() req: Request, @UploadedFile() file: Express.Multer.File){
    try {
      const avatar_url = `${process.env.BACKEND_SERVER_URL}/users/avatar/${file.filename}`;
      await this.usersService.updateUserAvatar(req.session.userid, avatar_url);
      return {avatar_url: avatar_url};
    } catch (err) {
      console.error(err);
      return (err);
    }
  }
  @ApiOperation({ summary: '유저 제거'})
  @ApiResponse({ type: ErrMsgDto, description: '유저 제거 실패시 실패 이유' })
  @Delete()
  async deleteUsers(@Req() req: Request){
    await this.sessionService.deleteSession(req.sessionID);
    return await this.usersService.deleteUsers(req.session.userid);
  }

  @ApiOperation({ summary: '나의 정보 검색'})
  @ApiResponse({ 
    type: UsersDto3, 
    description: `
      유저의 아이디, 닉네임, 아바타 url, 총 게임수, 이긴 게임수, 진 게임수, 래더점수, 유저의 상태
      검색 실패시 실패 이유
    ` })
  @Get('myself')
  async getMyInfo(@Req() req: Request){
    let user_id = await this.sessionService.readUserId(req.sessionID);
    return await this.usersService.readUsers(user_id, 'user_id');
  }
}