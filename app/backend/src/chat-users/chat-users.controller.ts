import { Body, Controller, Delete, forwardRef, Get, Inject, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatUsersDto1 } from 'src/dto/chat-users';
import { UsersDto5 } from 'src/dto/users';
import { Bool, ErrMsgDto } from 'src/dto/utility';
import { SessionService } from 'src/session/session.service';
import { UsersService } from 'src/users/users.service';
import { ChatUsersService } from './chat-users.service';
import { Request } from 'express';
import { LoggedInGuard } from 'src/auth/logged-in.guard';

@ApiTags('Chat-users')
@Controller('chat-users')
@UseGuards(new LoggedInGuard())
export class ChatUsersController {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => SessionService))
    private sessionService: SessionService,
    private chatUsersService: ChatUsersService
  ){}

  @ApiOperation({ summary: '채널에 유저 추가'})
  @ApiResponse({ type: ErrMsgDto, description: '채널에 유저 추가 실패시 실패 이유' })
  // @ApiBody({ type: ChatUsersDto1, description: '채널 아이디, 추가할 유저 아이디' })
  // @ApiBody({ type: ChatUsersDto1, description: '채널 아이디, 추가할 유저 닉네임' })
  @ApiBody({ type: ChatUsersDto1, description: '채널 아이디' })
  @Post()
  async createChatUsers(@Body() b: ChatUsersDto1, @Req() req: Request){
    let user_id;
    
    user_id = await this.sessionService.readUserId(req.sessionID);
    return await this.chatUsersService.createChatUsers(user_id, b.channel_id);
    // return this.chatUsersService.createChatUsers(b.user_id, b.channel_id);
  }

  @ApiOperation({ summary: '한 채널의 모든 유저 검색'})
  // @ApiResponse({ type: ChatUsersDto2, description: '해당 채널에 있는 유저 아이디 배열' })
  @ApiResponse({ type: UsersDto5, description: '해당 채널에 있는 유저 객체 배열' })
  @ApiQuery({ name: 'channel_id', example: 1, description: '유저를 검색할 채널 아이디' })
  @Get()
  readChatUsers(@Query() q: ChatUsersDto1){
    return this.chatUsersService.readChatUsers(q.channel_id);
  }

  @ApiOperation({ 
    summary: '한 유저의 채널 나가기', 
    description:`
      admin이 나가면 admin 자격 박탈 
      모든 유저가 채널에서 나가면 그 채널 삭제
      owner가 나가면 랜덤의 다른 인원으로 owner가 바뀜
    `})
  @ApiResponse({ 
    type: Bool, 
    description: `
      유저가 채널에서 나가기 성공시 true, 실패시 false
      나가기 실패시 실패 이유 반환
    ` })
  // @ApiQuery({ name: 'user_id', example: 'donglee', description: '채널에서 나갈 유저 아이디' })
  @ApiQuery({ name: 'nick', example: 'donglee', description: '채널에서 나갈 유저 닉네임' })
  // @ApiQuery({ name: 'channel_id', example: 1, description: '채널에서 나갈 채널 아이디' })
  @Delete()
  async deleteChatUsers(@Query() q: ChatUsersDto1, @Req() req: Request){
    let user_id;

    user_id = await this.sessionService.readUserId(req.sessionID);
    return await this.chatUsersService.deleteChatUsers(user_id, q.channel_id);
    // return this.chatUsersService.deleteChatUsers(q.user_id, q.channel_id);
  }
}
