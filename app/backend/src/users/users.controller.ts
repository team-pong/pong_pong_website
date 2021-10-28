import { Body, Controller, Delete, forwardRef, Get, Inject, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReadUserDto, ReadUserWithIdDto, UsersDto1, UsersDto2, UsersDto3, UsersDto4 } from 'src/dto/users';
import { ErrMsgDto } from 'src/dto/utility';
import { UsersService } from './users.service';
import { Request } from 'express';
import { SessionService } from 'src/session/session.service';
import { LoggedInGuard } from 'src/auth/logged-in.guard';

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
  async updateUsers(@Req() req: Request){
    const user_info = await this.usersService.getUserInfo(req.session.userid);
    return this.usersService.updateUsers(user_info.user_id, user_info.nick, user_info.avatar_url);
  }

  @ApiOperation({ summary: '유저 제거'})
  @ApiResponse({ type: ErrMsgDto, description: '유저 제거 실패시 실패 이유' })
  @Delete()
  async deleteUsers(@Req() req: Request){
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