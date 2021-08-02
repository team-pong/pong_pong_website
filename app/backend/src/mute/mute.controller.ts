import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { boolean, string } from 'joi';
import { MuteDto1, MuteDto2 } from 'src/dto/mute';
import { MuteService } from './mute.service';

@ApiTags('Mute')
@Controller('mute')
export class MuteController {
  constructor(private muteService: MuteService){}

  @ApiOperation({ summary: 'mute 설정'})
  @ApiResponse({ type: string, description: 'mute 설정 실패시 실패 이유' })
  @ApiBody({ type: MuteDto1, description: 'mute 설정할 채널아이디, 유저아이디' })
  @Post()
  createMute(@Body() b: MuteDto1){
    return this.muteService.createMute(b.user_id, b.channel_id);
  }

  @ApiOperation({ summary: '해당 유저가 해당 채널의 mute 인지 확인', description: 'mute 시간이 다지나면 mute 목록에서 지워짐'})
  @ApiResponse({ 
    type: boolean, 
    description: `
      유저가 mute이면 true, 아니면 false
      확인 실패시 실패 이유
    ` })
  @ApiBody({ type: MuteDto1, description: 'mute인지 확인할 유저아이디, 채널아이디' })
  @Get()
  isMute(@Body() b: MuteDto1){
    return this.muteService.isMute(b.user_id, b.channel_id);
  }

  @ApiOperation({ summary: '한 유저의 모든 mute 제거', description: '회원 탈퇴시 에만 사용됨'})
  @ApiResponse({ type: string, description: 'mute 제거 실패시 실패 이유' })
  @ApiBody({ type: MuteDto2, description: 'mute 제거할 유저아이디' })
  @Delete()
  deletemute(@Body() b: MuteDto2){
    return this.muteService.deleteMute(b.user_id);
  }
}