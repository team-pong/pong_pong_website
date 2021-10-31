import { Body, Controller, Delete, forwardRef, Get, Inject, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { string } from 'joi';
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { DmStoreDto1, ReadDmStoreDto } from 'src/dto/dm-store';
import { ErrMsgDto } from 'src/dto/utility';
import { SessionService } from 'src/session/session.service';
import { UsersService } from 'src/users/users.service';
import { DmStoreService } from './dm-store.service';

@ApiTags('DM-Store')
@Controller('dm-store')
@UseGuards(new LoggedInGuard())
export class DmStoreController {
  constructor(
    private dmStoreService: DmStoreService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => SessionService))
    private sessionService: SessionService,
  ){}

  // 사용하지 않을 수 있음 (대신 소켓, dmStoreService 사용)
  @ApiOperation({ summary: 'DM 저장'})
  @ApiResponse({ type: string, description: 'DM 저장 실패시 실패 이유' })
  // @ApiBody({ type: DmStoreDto1, description: 'DM 보낸 유저 아이디, 받은 유저 아이디, 내용' })
  // @ApiBody({ type: DmStoreDto1, description: 'DM 보낸 유저 닉네임, 받은 유저 닉네임, 내용' })
  @ApiBody({ type: DmStoreDto1, description: '받은 유저 닉네임, 내용' })
  @Post()
  async createDmStore(@Body() b: DmStoreDto1, @Req() req: Request){
    let user_id, receiver;
    // sender = await this.usersService.readUsers(b.sender_nick, 'nick');
    user_id = await this.sessionService.readUserId(req.sessionID); // 요청 보낸 사람
    receiver = await this.usersService.readUsers(b.receiver_nick, 'nick'); // dm 받을 사람
    return this.dmStoreService.createDmStore(user_id, receiver.user_id, b.content);
    // return this.dmStoreService.createDmStore(sender.user_id, receiver.user_id, b.content);
    // return this.dmStoreService.createDmStore(b.sender_id, b.receiver_id, b.content);
  }

  /*!
   * @brief DM창 처음 켰을때, 나랑 대화중인 상대 목록과 마지막 대화 내용, 시간을 리스트로 보내줌
  */
  @ApiOperation({ summary: 'DM 리스트 조회' })
  @ApiResponse({type: Array, description: ''})
  @Get('list')
  async getDmList(@Req() req: Request) {
    const user_id = await this.sessionService.readUserId(req.sessionID);
    return this.dmStoreService.getDmListOf(user_id);
  }

  // 한 사람과 대화했던 내용들
  @ApiOperation({ summary: 'DM 로그 검색'})
  @ApiResponse({ 
    type: Array, 
    description: `
      DM 보낸 유저 닉네임, 받은 유저 닉네임, 내용, 보낸 시간 데이터들의 배열
      검색 실패시 실패 이유 반환
    `})
  @ApiQuery({ name: 'receiver_nick', example: 'donglee', description: 'DM 로그 검색할 상대 닉네임' })
  @Get()
  async readDmStore(@Query() q: ReadDmStoreDto, @Req() req: Request){
      let user_id, receiver;
      user_id = await this.sessionService.readUserId(req.sessionID);
      receiver = await this.usersService.readUsers(q.receiver_nick, 'nick');
      return await this.dmStoreService.readDmStore(user_id, receiver.user_id);
  }

  @ApiOperation({ 
    summary: 'DM 로그 하나 삭제', 
    description: ` 입력받은 DM 로그 아이디에 해당하는 DM 로그 삭제 `})
  @ApiResponse({ type: ErrMsgDto, description: 'DM 로그 삭제 실패시 실패 이유' })
  @ApiQuery({ name: 'dm_log_id', example: '1' ,description: '삭제할 DM 로그 아이디' })
  @Delete('oneLog')
  deleteDmLog(@Query() q){
    return this.dmStoreService.deleteDmLog(q.dm_log_id);
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
  deleteDmStore(@Req() req: Request){
    return this.dmStoreService.deleteDmStore(req.session.userid);
  }
}