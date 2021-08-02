import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { boolean } from 'joi';
import { ChatUsersDto1, ChatUsersDto2, ChatUsersDto3 } from 'src/dto/chat-users';
import { ChatUsersService } from './chat-users.service';

@ApiTags('Chat-users')
@Controller('chat-users')
export class ChatUsersController {
  constructor(private chatUsersService: ChatUsersService){}

  @ApiOperation({ summary: '채널에 유저 추가'})
  @ApiResponse({ type: boolean, description: '채널에 유저 추가 실패시 실패 이유' })
  @ApiBody({ type: ChatUsersDto1, description: '채널 아이디, 추가할 유저 아이디' })
  @Post()
  createChatUsers(@Body() b: ChatUsersDto1){
    return this.chatUsersService.createChatUsers(b.user_id, b.channel_id);
  }

  @ApiOperation({ summary: '한 채널의 모든 유저 검색'})
  @ApiResponse({ type: ChatUsersDto3, description: '해당 채널에 있는 유저 아이디 배열' })
  @ApiBody({ type: ChatUsersDto2, description: '유저를 검색할 채널 아이디' })
  @Get()
  readChatUsers(@Body() b: ChatUsersDto2){
    return this.chatUsersService.readChatUsers(b.channel_id);
  }

  @ApiOperation({ 
    summary: '한 유저의 채널 나가기', 
    description:`
      admin이 나가면 admin 자격 박탈 
      모든 유저가 채널에서 나가면 그 채널 삭제
      owner가 나가면 랜덤의 다른 인원으로 owner가 바뀜
    `})
  @ApiResponse({ 
    type: boolean, 
    description: `
      유저가 채널에서 나가기 성공시 true, 실패시 false
      나가기 실패시 실패 이유 반환
    ` })
  @ApiBody({ type: ChatUsersDto1, description: '채널에서 나갈 유저 아이디, 채널 아이디' })
  @Delete()
  deleteChatUsers(@Body() b: ChatUsersDto1){
    return this.chatUsersService.deleteChatUsers(b.user_id, b.channel_id);
  }
}
