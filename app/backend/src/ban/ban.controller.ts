import { Controller, Post, Body, Get, Delete } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { boolean } from 'joi';
import { BanService } from './ban.service';
import { BanDto1, BanDto2, BanDto3, BanDto4 } from 'src/dto/ban';

@ApiTags('Ban')
@Controller('ban')
export class BanController {
  constructor(private banService: BanService){}

  // ban 설정
  @ApiResponse({ type: boolean, description: 'ban 설정 성공시 true, 실패시 false' })
  @ApiBody({ type: BanDto1, description: 'ban 설정할 채널아이디, 유저아이디' })
  @Post()
  createBan(@Body() b: BanDto1){
    return this.banService.createBan(b.user_id, b.channel_id);
  }

  // ban 검색
  @ApiResponse({ type: BanDto2, description: '해당 채널의 ban 유저아이디 배열' })
  @ApiBody({ type: BanDto3, description: 'ban을 검색할 채널아이디' })
  @Get()
  readBan(@Body() b: BanDto3){
    return this.banService.readBan(b.channel_id);
  }
  // 해당 유저가 해당 채널의 ban 인지 확인
  @ApiResponse({ type: boolean, description: '유저가 ban이면 true, 아니면 false' })
  @ApiBody({ type: BanDto1, description: 'ban인지 확인할 유저아이디, 채널아이디' })
  @Get('isBan')
  isBan(@Body() b: BanDto1){
    return this.banService.isBan(b.user_id, b.channel_id);
  }

  // 해당 채널의 한 유저의 ban 제거
  @ApiResponse({ type: boolean, description: 'ban 제거 성공시 true, 실패시 false' })
  @ApiBody({ type: BanDto1, description: 'ban 제거할 유저아이디, 채널아이디' })
  @Delete()
  deleteBan(@Body() b: BanDto1){
    return this.banService.deleteBan(b.user_id, b.channel_id);
  }
  // 한 유저의 모든 ban 제거
  @ApiResponse({ type: boolean, description: 'ban 제거 성공시 true, 실패시 false' })
  @ApiBody({ type: BanDto4, description: 'ban 제거할 유저아이디' })
  @Delete('all')
  deleteAllBan(@Body() b: BanDto4){
    return this.banService.deleteAllBan(b.user_id);
  }
}
