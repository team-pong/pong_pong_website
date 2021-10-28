 import { Body, Controller, Get, Post, Delete, Query, forwardRef, Inject, UseGuards, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { MatchDto3, ReadMatchDto } from 'src/dto/match';
import { ErrMsgDto } from 'src/dto/utility';
import { UsersService } from 'src/users/users.service';
import { MatchService } from './match.service';

@ApiTags('Match')
@Controller('match')
@UseGuards(new LoggedInGuard())
export class MatchController {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private matchService: MatchService
  ){}

  @ApiOperation({ summary: '해당 유저의 모든 전적 검색'})
  @ApiResponse({ 
    type: MatchDto3, 
    description: `
      유저(아바타, nickname, 점수), 상대(아바타, nickname, 점수), 시간, 게임종류, 맵정보, 승패여부 데이터를 가지는 배열
      검색 실패시 실패 이유 반환
    ` })
  @ApiQuery({ name: 'nick', example: 'jinbkim', description: '모든 전적을 검색할 유저 닉네임' })
  @Get()
  async readAllMatch(@Query() q: ReadMatchDto){
    let user_id;
    await this.matchService.nickToId(q.nick).then((v) => { user_id = v; });
    return this.matchService.readMatch(user_id, 'all');
  }

  @ApiOperation({ summary: '해당 유저의 일반 전적 검색'})
  @ApiResponse({ 
    type: MatchDto3, 
    description: `
      유저(아바타, nickname, 점수), 상대(아바타, nickname, 점수), 시간, 게임종류, 맵정보, 승패여부 데이터를 가지는 배열
      검색 실패시 실패 이유 반환
    ` })
  @ApiQuery({ name: 'nick', example: 'jinbkim', description: '일반 전적을 검색할 유저 닉네임' })
  @Get('general')
  async readGeneralMatch(@Query() q: ReadMatchDto){
    let user_id;
    await this.matchService.nickToId(q.nick).then((v) => { user_id = v; });
    return this.matchService.readMatch(user_id, 'general');
  }

  @ApiOperation({ summary: '해당 유저의 래더 전적 검색'})
  @ApiResponse({ 
    type: MatchDto3, 
    description: `
      유저(아바타, nickname, 점수), 상대(아바타, nickname, 점수), 시간, 게임종류, 맵정보, 승패여부 데이터를 가지는 배열
      검색 실패시 실패 이유 반환
    ` })
  @ApiQuery({ name: 'nick', example: 'jinbkim', description: '래더 전적을 검색할 유저 닉네임' })
  @Get('ranked')
  async readRankedMatch(@Query() q: ReadMatchDto){
    let user_id;
    await this.matchService.nickToId(q.nick).then((v) => { user_id = v; });
    return this.matchService.readMatch(user_id, 'ranked');
  }

  @ApiOperation({ summary: '모든 유저의 래더 랭킹 검색'})
  @ApiResponse({ 
    type: MatchDto3, 
    description: `유저 닉네임, 아바타 이미지 url, 이긴 게임수, 진게임수, 래더 점수 데이터를 담은 배열` })
  @Get('ranking')
  readRanking(){
    return this.matchService.readRanking();
  }

  @ApiOperation({ 
    summary: '해당 유저의 모든 전적 삭제',
    description: `
      회원 탈퇴시에만 사용됨
      실제로 지우는게 아니라 이름을 unknown 으로 바꿈
    `})
  @ApiResponse({ type: ErrMsgDto, description: '전적 삭제 실패시 실패 이유' })
  @ApiQuery({ name: 'user_id', example: 'jinbkim', description: '모든 전적을 삭제할 유저 아이디' })
  @Delete()
  deleteMatch(@Req() req: Request){
    return this.matchService.deleteMatch(req.session.userid);
  }
}