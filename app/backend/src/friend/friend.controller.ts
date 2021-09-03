import { Body, Controller, Delete, forwardRef, Get, Inject, Post, Query, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FriendDto1 } from 'src/dto/friend';
import { UsersDto5 } from 'src/dto/users';
import { Bool, ErrMsgDto } from 'src/dto/utility';
import { SessionService } from 'src/session/session.service';
import { FriendService } from './friend.service';
import { Request } from 'express';

@ApiTags('Friend')
@Controller('friend')
export class FriendController {
  constructor(
    @Inject(forwardRef(() => FriendService))
    private friendService: FriendService,
    @Inject(forwardRef(() => SessionService))
    private sessionService: SessionService,
  ){}

  @ApiOperation({ summary: '친구 추가'})
  @ApiResponse({ type: ErrMsgDto, description: '친구 추가 실패시 실패 이유' })
  @ApiBody({ type: FriendDto1, description: '내 유저 아이디, 친구 추가할 유저 아이디' })
  @Post()
  createFriend(@Body() b: FriendDto1){
    return this.friendService.createFriend(b.user_id, b.friend_id);
  }

  @ApiOperation({ 
    summary: '해당 유저의 모든 친구 검색', 
    description : `세션 아이디로 검색`
  })
  @ApiResponse({ 
    // type: FriendDto2, 
    type: UsersDto5,
    description: `
      해당 유저의 친구 유저 객체 배열
      검색 실패시 실패 이유 반환
    `})
  // @ApiQuery({ name: 'user_id', example: 'jinbkim', description: '모든 친구들 검색할 유저 아이디 ' })
  // @ApiQuery({ name: 'sid', example: '0TBeNj59PUBZ_XjbXGKq9sHHPHCkZky4', description: '세션아이디' })
  @Get('list')
  // async readFriend1(@Query() q){
  async readFriend1(@Req() req: Request){
    // let user_id = await this.sessionService.readUserId(q.sid);
    let user_id = await this.sessionService.readUserId(req.sessionID);
    return this.friendService.readFriend(user_id, 'send');
  }
  @ApiOperation({ summary: '해당 유저를 친구 추가한 모든 유저 검색'})
  @ApiResponse({ 
    // type: FriendDto2, 
    type: UsersDto5,
    description: `
      해당 유저를 친구 추가한 유저 객체 배열
      검색 실패시 실패 이유 반환
    ` })
  @ApiQuery({ name: 'user_id', example: 'jinbkim', description: '자신을 친구 추가한 모든 유저들을 검색할 유저 아이디'})
  @Get('list2')
  readFriend2(@Query() q){
    return this.friendService.readFriend(q.user_id, 'receive');
  }
  @ApiOperation({ summary: '해당 유저가 친구 추가한 유저 인지 확인'})
  @ApiResponse({ 
    type: Bool, 
    description: `
      이미 친구 추가한 유저 이면 true, 아니면 false
      확인 실패시 실패 이유 반환
    ` })
  @ApiQuery({ name: 'user_id', example: 'jinbkim' ,description: 'friend인지 확인할 유저아이디' })
  @ApiQuery({ name: 'friend_id', example: 'donglee' ,description: 'friend인지 확인할 상대아이디' })
  @Get()
  isFriend(@Query() q){
    return this.friendService.isFriend(q.user_id, q.friend_id);
  }

  @ApiOperation({ summary: '친구 삭제'})
  @ApiResponse({ type: ErrMsgDto, description: 'friend 삭제 실패시 실패 이유' })
  @ApiQuery({ name: 'user_id', example: 'jinbkim', description: '내 유저 아이디' })
  @ApiQuery({ name: 'friend_id', example: 'donglee', description: '친구 삭제할 유저 아이디' })
  @Delete()
  deleteFriend(@Query() q){
    return this.friendService.deleteFriend(q.user_id, q.friend_id);
  }
  @ApiOperation({ summary: '해당 유저 관련 모든 친구 관계 삭제'})
  @ApiResponse({ type: ErrMsgDto, description: '모든 친구 관계 삭제 실패시 실패 이유' })
  @ApiQuery({ name: 'user_id', example: 'jinbkim', description: '모든 친구 관계를 삭제할 유저 아이디' })
  @Delete('all')
  deleteAllFriend(@Query() q){
    return this.friendService.deleteAllFriend(q.user_id);
  } 
}