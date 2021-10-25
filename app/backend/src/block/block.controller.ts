import { Body, Controller, Delete, forwardRef, Get, Inject, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BlockDto1 } from 'src/dto/block';
import { UsersDto5 } from 'src/dto/users';
import { Bool, ErrMsgDto } from 'src/dto/utility';
import { SessionService } from 'src/session/session.service';
import { UsersService } from 'src/users/users.service';
import { BlockService } from './block.service';
import { Request } from 'express';
import { LoggedInGuard } from 'src/auth/logged-in.guard';

@ApiTags('Block')
@Controller('block')
@UseGuards(new LoggedInGuard())
export class BlockController {
  constructor(
    private blockService: BlockService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => SessionService))
    private sessionService: SessionService,

    ){}

  @ApiOperation({ summary: '차단 추가', description: '친구인 상태이면 친구 삭제'})
  @ApiResponse({ type: ErrMsgDto, description: '차단 추가 실패시 실패이유' })
  // @ApiBody({ type: BlockDto1, description: '내 유저 아이디, 차단할 유저 아이디' })
  // @ApiBody({ type: BlockDto1, description: '내 유저 닉네임, 차단할 유저 닉네임' })
  @ApiBody({ type: BlockDto1, description: '차단할 유저 닉네임' })
  @Post()
  async createBlock(@Body() b: BlockDto1, @Req() req: Request){
    let block, user_id;
    user_id = await this.sessionService.readUserId(req.sessionID);
    // user = await this.usersService.readUsers(b.user_nick, 'nick');
    block = await this.usersService.readUsers(b.block_nick, 'nick');
    // return await this.blockService.createBlock(user.user_id, block.user_id);
    return await this.blockService.createBlock(user_id, block.user_id);
    // return this.blockService.createBlock(b.user_id, b.block_id);
  }

  @ApiOperation({ summary: '해당 유저의 차단 목록 검색'})
  @ApiResponse({ 
    // type: BlockDto2,
    type: UsersDto5, 
    description: `
      해당 유저의 차단 객체 배열
      검색 실패시 실패 이유 반환
    ` })
  // @ApiQuery({ name: 'user_id', example: 'jinbkim', description: '차단 목록을 검색할 유저 아이디' })
  // @ApiQuery({ name: 'nick', example: 'jinbkim', description: '차단 목록을 검색할 유저 닉네임' })
  @Get()
  // async readblock(@Query() q){
  async readblock(@Req() req: Request){
    let user_id;
    // user = await this.usersService.readUsers(q.nick, 'nick');
    user_id = await this.sessionService.readUserId(req.sessionID);
    return this.blockService.readBlock(user_id);
    // return this.blockService.readBlock(user.user_id);
  }
  @ApiOperation({ summary: '해당 유저가 차단한 유저 인지 확인'})
  @ApiResponse({
    type: Bool, 
    description: `
      이미 차단한 유저 이면 true, 아니면 false
      확인 실패시 실패 이유 반환
    ` })
  // @ApiQuery({ name: 'user_id', example: 'jinbkim', description: '유저 아이디' })
  // @ApiQuery({ name: 'block_id', example: 'hna' ,description: '차단 유저 아이디' })
  // @ApiQuery({ name: 'user_nick', example: 'jinbkim', description: '유저 닉네임' })
  @ApiQuery({ name: 'block_nick', example: 'hna' ,description: '차단 유저 닉네임' })
  @Get('isBlock')
  async isBlock(@Query() q, @Req() req: Request){
    let user_id, block;
    // user = await this.usersService.readUsers(q.user_nick, 'nick');
    user_id = await this.sessionService.readUserId(req.sessionID);
    block = await this.usersService.readUsers(q.block_nick, 'nick');
    return await this.blockService.isBlock(user_id, block.user_id);
    // return await this.blockService.isBlock(user.user_id, block.user_id);
    // return this.blockService.isBlock(q.user_id, q.block_id);
  }

  @ApiOperation({ summary: '차단 해제'})
  @ApiResponse({ type: ErrMsgDto, description: '차단 해제 실패시 실패이유' })
  // @ApiQuery({ name: 'user_id', example: 'jinbkim', description: '유저 아이디' })
  // @ApiQuery({ name: 'block_id', example: 'hna', description: '차단 해제 할 유저 아이디' })
  // @ApiQuery({ name: 'user_nick', example: 'jinbkim', description: '유저 닉네임' })
  @ApiQuery({ name: 'block_nick', example: 'hna', description: '차단 해제 할 유저 닉네임' })
  @Delete()
  async deleteBlock(@Query() q: BlockDto1, @Req() req: Request){
    let user_id, block;
    // user = await this.usersService.readUsers(q.user_nick, 'nick');
    user_id = await this.sessionService.readUserId(req.sessionID);
    block = await this.usersService.readUsers(q.block_nick, 'nick');
    return await this.blockService.deleteBlock(user_id, block.user_id);
    // return await this.blockService.deleteBlock(user.user_id, block.user_id);
    // return this.blockService.deleteBlock(q.user_id, q.block_id);
  }
  
  @ApiOperation({ summary: '해당 유저에 대한 모든 차단 관계 해제', description: '회원 탈퇴시 에만 사용됨'})
  @ApiResponse({ type: ErrMsgDto, description: '차단 해제 실패시 실패이유' })
  @ApiQuery({ name: 'user_id', example: 'jinbkim' ,description: '모든 차단 관계를 해제할 유저 아이디' })
  @Delete('all')
  deleteAllBlock(@Query() q){
     // session 사용하는거로 바뀌면 DTO가 필요 없어질거같음
    return this.blockService.deleteAllBlock(q.user_id);
  }
}