import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { string } from 'joi';
import { DmStoreDto1, DmStoreDto3 } from 'src/dto/dm-store';
import { DmStoreService } from './dm-store.service';

@ApiTags('DM-Store')
@Controller('dm-store')
export class DmStoreController {

  constructor(private dmStoreService: DmStoreService){}

  @ApiOperation({ summary: 'DM 저장'})
  @ApiResponse({ type: string, description: 'DM 저장 실패시 실패 이유' })
  @ApiBody({ type: DmStoreDto1, description: 'DM 보낸 유저 아이디, 받은 유저 아이디, 내용' })
  @Post()
  createDmStore(@Body() b: DmStoreDto1){
    return this.dmStoreService.createDmStore(b.sender_id, b.receiver_id, b.content);
  }

  @ApiOperation({ summary: 'DM 로그 검색'})
  @ApiResponse({ 
    type: DmStoreDto3, 
    description: `
      DM 보낸 유저 아이디, 받은 유저 아이디, 내용, 보낸 시간 데이터들의 배열
      검색 실패시 실패 이유 반환
    `})
  @ApiQuery({ name: 'user_id', example: 'jinbkim', description: 'DM 로그 검색할 유저 아이디' })
  @ApiQuery({ name: 'other_id', example: 'donglee', description: 'DM 로그 검색할 상대 아이디' })
  @Get()
  readDmStore(@Query() q){
    return this.dmStoreService.readDmStore(q.user_id, q.other_id);
  }

  @ApiOperation({ 
    summary: 'DM 로그 삭제', 
    description: `
    회원 탈퇴시 에만 사용됨
    진짜 로그를 지우는게 아니라 아이디만 unknown으로 변경
    `})
  @ApiResponse({ type: string, description: 'DM 로그 삭제 실패시 실패 이유' })
  @ApiQuery({ name: 'user_id', example: 'jinbkim' ,description: 'DM 로그 삭제할 유저 아이디' })
  @Delete()
  deleteDmStore(@Query() q){
    return this.dmStoreService.deleteDmStore(q.user_id);
  }
}