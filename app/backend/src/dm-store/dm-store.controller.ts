import { Body, Controller, Delete, forwardRef, Get, Inject, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { string } from 'joi';
import { DmStoreDto1, DmStoreDto3 } from 'src/dto/dm-store';
import { UsersService } from 'src/users/users.service';
import { DmStoreService } from './dm-store.service';

@ApiTags('DM-Store')
@Controller('dm-store')
export class DmStoreController {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private dmStoreService: DmStoreService,
  ){}

  @ApiOperation({ summary: 'DM 저장'})
  @ApiResponse({ type: string, description: 'DM 저장 실패시 실패 이유' })
  // @ApiBody({ type: DmStoreDto1, description: 'DM 보낸 유저 아이디, 받은 유저 아이디, 내용' })
  @ApiBody({ type: DmStoreDto1, description: 'DM 보낸 유저 닉네임, 받은 유저 닉네임, 내용' })
  @Post()
  async createDmStore(@Body() b: DmStoreDto1){
    let sender, receiver;
    sender = await this.usersService.readUsers(b.sender_nick, 'nick');
    receiver = await this.usersService.readUsers(b.receiver_nick, 'nick');
    return this.dmStoreService.createDmStore(sender.user_id, receiver.user_id, b.content);
    // return this.dmStoreService.createDmStore(b.sender_id, b.receiver_id, b.content);
  }

  @ApiOperation({ summary: 'DM 로그 검색'})
  @ApiResponse({ 
    type: DmStoreDto3, 
    description: `
      DM 보낸 유저 닉네임, 받은 유저 닉네임, 내용, 보낸 시간 데이터들의 배열
      검색 실패시 실패 이유 반환
    `})
  // @ApiQuery({ name: 'user_id', example: 'jinbkim', description: 'DM 로그 검색할 유저 아이디' })
  // @ApiQuery({ name: 'other_id', example: 'donglee', description: 'DM 로그 검색할 상대 아이디' })
  @ApiQuery({ name: 'sender_nick', example: 'jinbkim', description: 'DM 로그 검색할 유저 닉네임' })
  @ApiQuery({ name: 'receiver_nick', example: 'donglee', description: 'DM 로그 검색할 상대 닉네임' })
  @Get()
  async readDmStore(@Query() q){
    let sender, receiver;
    sender = await this.usersService.readUsers(q.sender_nick, 'nick');
    receiver = await this.usersService.readUsers(q.receiver_nick, 'nick');
    return await this.dmStoreService.readDmStore(sender.user_id, receiver.user_id);
    // return this.dmStoreService.readDmStore(q.user_id, q.other_id);
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