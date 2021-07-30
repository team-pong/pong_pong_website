import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { boolean } from 'joi';
import { ChatDto1, ChatDto3, ChatDto4, ChatDto5, ChatDto6, ChatDto7, ChatDto8 } from 'src/dto/chat';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService){}

  // 채널 생성
  @ApiResponse({ type: boolean, description: '채널 생성 성공시 true, 실패시 false' })
  @ApiBody({ type: ChatDto1, description: '채널 방장, 제목, 타입, 비밀번호, 최대인원' })
  @Post()
  creatChat(@Body() b: ChatDto1){
    return this.chatService.createChat(b.owner_id, b.title, b.type, b.passwd, b.max_people);
  }

  // 모든 채널 검색
  @ApiResponse({ type: ChatDto3, description: '모든 채널의 제목, 타입, 최대인원' })
  @Get()
  readChat(){
    return this.chatService.readChat();
  }
  // 채널 제목 검색
  @ApiResponse({ type: ChatDto3, description: '모든 채널의 제목, 타입, 최대인원' })
  @Get('title')
  readTitle(@Body() b:ChatDto8){
    return this.chatService.readTitle(b.title);
  }
  // 채널 방장 검색
  @ApiResponse({ type: ChatDto7, description: '해당 채널의 방장 아이디' })
  @ApiBody({ type: ChatDto6, description: '채널 아이디' })
  @Get('owner')
  readOwner(@Body() b: ChatDto6){
    return this.chatService.readOwner(b.channel_id);
  }

  // 채널 설정 변경
  @ApiResponse({ type: boolean, description: '채널 설정 변경 성공시 true, 실패시 false' })
  @ApiBody({ type: ChatDto4, description: '채널 아이디, 제목, 타입, 비밀번호, 최대인원' })
  @Post('channel')
  updateChat(@Body() b: ChatDto4){
    return this.chatService.updateChat(b.channel_id, b.title, b.type, b.passwd, b.max_people);
  }
  // 채널 방장 변경
  @ApiResponse({ type: boolean, description: '채널 방장 변경 성공시 true, 실패시 false' })
  @ApiBody({ type: ChatDto5, description: '방장 변경할 채널 아이디, 유저 아이디' })
  @Post('owner')
  updateOwner(@Body() b: ChatDto5){
    return this.chatService.updateOwner(b.channel_id, b.owner_id);
  }

  // 채널 제거
  @ApiResponse({ type: boolean, description: '채널 제거 성공시 true, 실패시 false' })
  @ApiBody({ type: ChatDto6, description: '제거할 채널 아이디' })
  @Delete()
  deleteChat(@Body() b: ChatDto6){
    return this.chatService.deleteChat(b.channel_id);
  }
}
