import { Body, Controller, Delete, forwardRef, Get, Inject, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { NotLoggedInGuard } from 'src/auth/not-logged-in.guard';
import { ChatDto1, ChatDto2, ChatDto3, ChatDto4, ChatDto5, ChatDto6, CheckChatPasswordDto, ReadChatTitleDto, ReadOneChatDto, ReadOwnerDto } from 'src/dto/chat';
import { UsersDto3 } from 'src/dto/users';
import { Bool, ErrMsgDto } from 'src/dto/utility';
import { UsersService } from 'src/users/users.service';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(new LoggedInGuard())
export class ChatController {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private chatService: ChatService
  ) {}

  // @todo owner_id를 프론트에서 보내는게 아닌 백엔드에서 알아 낼 수 있도록 수정 -> 이렇게 하면 api테스트시 어려움
  @ApiOperation({ summary: '채널 생성', description: '채팅방 타입은 public 또는 protected 또는 private 이어야함'})
  // @ApiResponse({ type: ErrMsgDto, description: '채널 생성 실패시 실패이유' })
  @ApiResponse({ type: ChatDto2, description: `생성된 채널의 제목, 타입, 현재인원, 최대인원, 채널 아이디` })
  @ApiBody({ type: ChatDto1, description: '채널 owner, 제목, 타입, 비밀번호, 최대인원' })
  @Post()
  creatChat(@Body() b: ChatDto1, @Req() req: Request){
    return this.chatService.createChat(req.session.userid, b.title, b.type, b.passwd, b.max_people);
  }

  @ApiOperation({ summary: '모든 채널 검색'})
  @ApiResponse({ type: ChatDto3, description: `모든 채널의 제목, 타입, 현재인원, 최대인원, 채널 아이디` })
  @Get()
  @ApiQuery({ name: 'channel_id', })
  readChat(){
    return this.chatService.readChat();
  }

  @ApiOperation({ summary: '채널 아이디로 채널 검색'})
  @ApiResponse({ type: ChatDto6, description: `채널의 제목, 타입, 비밀번호, 최대인원, 현재인원, 유저 닉네임, 채널 아이디` })
  @Get('oneChat')
  @ApiQuery({ name: 'channel_id', example: 1, description: '채널 아이디' })
  readOneChat(@Query() q: ReadOneChatDto){
    return this.chatService.readOneChat(q.channel_id);
  }
  
  @ApiOperation({ summary: '제목으로 채널 검색'})
  @ApiResponse({ type: ChatDto3, description: `모든 채널의 제목, 타입, 현재인원, 최대인원, 채널 아이디` })
  @Get('title')
  @ApiQuery({ name: 'title', example:'아무나', description: '검색할 채널 제목' })
  readTitle(@Query() q: ReadChatTitleDto){
    return this.chatService.readTitle(q.title);
  }

  @ApiOperation({ summary: '채널 owner 검색'})
  @ApiResponse({ 
    // type: ChatDto6, 
    type: UsersDto3, 
    description: `
      해당 채널의 owner 유저 객체
      검색 실패시 실패 이유 반환
    ` })
  @ApiQuery({ name: 'channel_id', example: 1, description: '채널 아이디' })
  @Get('owner')
  readOwner(@Query() q: ReadOwnerDto){
    return this.chatService.readOwner(q.channel_id);
  }

  @ApiOperation({ summary: '해당 채널의 비밀번호가 맞는지 확인'})
  @ApiResponse({ 
    type: Bool, 
    description: `
      비밀번호가 맞으면 true, 아니면 false
      확인 실패시 실패 이유 반환
    ` })
  @Get('checkPasswd')
  @ApiQuery({ name: 'passwd', example: '1234', description: '채널 비밀번호' })
  @ApiQuery({ name: 'channel_id', example: 1, description: '채널 아이디' })
  checkPasswd(@Query() q: CheckChatPasswordDto){
    return this.chatService.checkPasswd(q.channel_id, q.passwd);
  }

  @ApiOperation({ summary: '채널 설정 변경', description: '채팅방 타입은 public 또는 protected 또는 private 이어야함'})
  @ApiResponse({ type: ErrMsgDto, description: '채널 설정 변경 실패시 실패이유' })
  @ApiBody({ type: ChatDto4, description: '채널 아이디, 제목, 타입, 비밀번호, 최대인원' })
  @Post('channel')
  updateChat(@Body() b: ChatDto4){
    return this.chatService.updateChat(b.channel_id, b.title, b.type, b.passwd, b.max_people);
  }

  @ApiOperation({ summary: '채널 owner 변경'})
  @ApiResponse({ type: ErrMsgDto, description: '채널 owner 실패시 실패이유' })
  // @ApiBody({ type: ChatDto5, description: 'owner 변경할 채널 아이디, 유저 아이디' })
  @ApiBody({ type: ChatDto5, description: 'owner 변경할 채널 아이디, 유저 닉네임' })
  @Post('owner')
  async updateOwner(@Body() b: ChatDto5){
    let user;
    user = await this.usersService.readUsers(b.owner_nick, 'nick');
    return await this.chatService.updateOwner(b.channel_id, user.user_id);
    // return this.chatService.updateOwner(b.channel_id, b.owner_id);
  }

  // 아래 api들은 없애야 할 것 같음

  @ApiOperation({ summary: '채널 제거'})
  @ApiResponse({ type: ErrMsgDto, description: '채널 제거 실패시 실패이유' })
  @ApiQuery({ name: 'channel_id', example: 1, description: '제거할 채널 아이디' })
  @Delete()
  deleteChat(@Query() q){
    return this.chatService.deleteChat(q.channel_id);

  }
  
  /*
  @todo userid 부분을 req.session.userid를 사용할지 req.body.userid를 사용할지 결정
  */
  @ApiOperation({ summary: '채팅 전송' })
  @ApiBody({ description: '채팅친 유저 닉네임, 채팅 내용' })
  @Post(':channel_id')
  postChat(@Body() body, @Req() req: Request) {
    this.chatService.emitChat(req.params.channel_id, req.session.userid, req.body.chat);
    return ('ok');
  }
}
