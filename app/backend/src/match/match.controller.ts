import { Body, Controller, Get, Post, Delete, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MatchDto1, MatchDto3 } from 'src/dto/match';
import { ErrMsgDto } from 'src/dto/utility';
import { MatchService } from './match.service';

@ApiTags('Match')
@Controller('match')
export class MatchController {
  constructor(private matchService: MatchService){}

  @ApiOperation({ 
    summary: '전적 추가', 
    description: `
      맵은 1, 2, 3 중에 하나 이어야함.
      총게임수 +1, 승자는 1승추가, 패자는 1패추가.
      랭크 게임이면 래더점수 변동이 있음.
      게임 타입은 general 또는 ranked 이어야함.
    `})
  @ApiResponse({ type: ErrMsgDto, description: '전적 추가 실패시 실패 이유' })
  @ApiBody({ type: MatchDto1, description: '승자 아이디, 패자 아이디, 승자 점수, 패자 점수, 게임 타입, 맵정보' })
  @Post()
  createMatch(@Body() b: MatchDto1){
    return this.matchService.createMatch(b.winner_id, b.loser_id, b.winner_score, b.loser_score, b.type, b.map);
  }

  @ApiOperation({ summary: '해당 유저의 모든 전적 검색'})
  @ApiResponse({ 
    type: MatchDto3, 
    description: `
      유저(아바타, nickname, 점수), 상대(아바타, nickname, 점수), 시간, 게임종류, 맵정보, 승패여부 데이터를 가지는 배열
      검색 실패시 실패 이유 반환
    ` })
  @ApiQuery({ name: 'user_id', example: 'jinbkim', description: '모든 전적을 검색할 유저 아이디' })
  @Get()
  readAllMatch(@Query() q){
    return this.matchService.readMatch(q.user_id, 'all');
  }
  @ApiOperation({ summary: '해당 유저의 일반 전적 검색'})
  @ApiResponse({ 
    type: MatchDto3, 
    description: `
      유저(아바타, nickname, 점수), 상대(아바타, nickname, 점수), 시간, 게임종류, 맵정보, 승패여부 데이터를 가지는 배열
      검색 실패시 실패 이유 반환
    ` })
  @ApiQuery({ name: 'user_id', example: 'jinbkim', description: '일반 전적을 검색할 유저 아이디' })
  @Get('general')
  readGeneralMatch(@Query() q){
    return this.matchService.readMatch(q.user_id, 'general');
  }
  @ApiOperation({ summary: '해당 유저의 래더 전적 검색'})
  @ApiResponse({ 
    type: MatchDto3, 
    description: `
      유저(아바타, nickname, 점수), 상대(아바타, nickname, 점수), 시간, 게임종류, 맵정보, 승패여부 데이터를 가지는 배열
      검색 실패시 실패 이유 반환
    ` })
  @ApiQuery({ name: 'user_id', example: 'jinbkim', description: '래더 전적을 검색할 유저 아이디' })
  @Get('ranked')
  readRankedMatch(@Query() q){
    return this.matchService.readMatch(q.user_id, 'ranked');
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
  deleteMatch(@Query() q){
    return this.matchService.deleteMatch(q.user_id);
  }
}