import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { boolean } from 'joi';
import { DmStoreDto1, DmStoreDto2, DmStoreDto3, DmStoreDto4 } from 'src/dto/dm-store';
import { DmStoreService } from './dm-store.service';

@ApiTags('DM-Store')
@Controller('dm-store')
export class DmStoreController {

  constructor(private dmStoreService: DmStoreService){}

  @ApiOperation({ summary: 'DM 저장'})
  @ApiResponse({ type: boolean, description: 'DM 저장 성공시 true, 실패시 false' })
  @ApiBody({ type: DmStoreDto1, description: 'DM 보낸 유저 아이디, 받은 유저 아이디, 내용' })
  @Post()
  createDmStore(@Body() b: DmStoreDto1){
    return this.dmStoreService.createDmStore(b.sender_id, b.receiver_id, b.content);
  }

  @ApiOperation({ summary: 'DM 로그 검색'})
  @ApiResponse({ type: DmStoreDto4, description: 'DM 보낸 유저 아이디, 받은 유저 아이디, 내용, 보낸 시간 데이터들의 배열' })
  @ApiBody({ type: DmStoreDto3, description: 'DM 로그 검색할 유저 아이디, 상대 아이디' })
  @Get()
  readDmStore(@Body() b: DmStoreDto3){
    return this.dmStoreService.readDmStore(b.user_id, b.other_id);
  }
}