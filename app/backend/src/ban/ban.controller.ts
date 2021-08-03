import { Controller, Post, Body, Get, Delete, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { boolean, string } from 'joi';
import { BanService } from './ban.service';
import { BanDto1 } from 'src/dto/ban';

@ApiTags('Ban')
@Controller('ban')
export class BanController {
  constructor(private banService: BanService){}

  @ApiOperation({ summary: 'ban 설정'})
  @ApiResponse({ type: string, description: 'ban 설정 실패시 실패이유' })
  @ApiBody({ type: BanDto1, description: 'ban 설정할 채널아이디, 유저아이디' })
  @Post()
  createBan(@Body() b: BanDto1){
    return this.banService.createBan(b.user_id, b.channel_id);
  }

  @ApiOperation({ 
    summary: '해당 유저가 해당 채널의 ban 인지 확인', 
    description: `
      ban 시간이 다지나면 ban 목록에서 지워짐
      확인 실패시 실패 이유 반환
    `})
  @ApiResponse({ type: boolean, description: '유저가 ban이면 true, 아니면 false' })
  @ApiQuery({ name:'user_id', example: 'donglee', description: 'ban인지 확인할 유저아이디' })
  @ApiQuery({ name:'channel_id', example: 2, description: 'ban인지 확인할 채널아이디' })
  @Get()
  isBan(@Query() q){
    return this.banService.isBan(q.user_id, q.channel_id);
  }

  @ApiOperation({ summary: '한 유저의 모든 ban 제거', description: '회원 탈퇴시 에만 사용됨'})
  @ApiResponse({ type: string, description: 'ban 제거 실패시 실패이유' })
  @ApiQuery({ name: 'user_id', example: 'hna' ,description: 'ban 제거할 유저아이디' })
  @Delete()
  deleteBan(@Query() q){
    return this.banService.deleteBan(q.user_id);
  }
}