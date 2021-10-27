import { Body, Controller, Delete, forwardRef, Get, Inject, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FriendDto1 } from 'src/dto/friend';
import { UsersDto5 } from 'src/dto/users';
import { Bool, ErrMsgDto } from 'src/dto/utility';
import { SessionService } from 'src/session/session.service';
import { UsersService } from 'src/users/users.service';
import { FriendService } from './friend.service';
import { Request } from 'express';
import { LoggedInGuard } from 'src/auth/logged-in.guard';

@ApiTags('Friend')
@Controller('friend')
@UseGuards(new LoggedInGuard())
export class FriendController {
  constructor(
    @Inject(forwardRef(() => FriendService))
    private friendService: FriendService,
    @Inject(forwardRef(() => SessionService))
    private sessionService: SessionService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ){}

  @ApiOperation({ summary: '친구 추가'})
  @ApiResponse({ type: ErrMsgDto, description: '친구 추가 실패시 실패 이유' })
  // @ApiBody({ type: FriendDto1, description: '내 유저 아이디, 친구 추가할 유저 아이디' })
  // @ApiBody({ type: FriendDto1, description: '내 유저 닉네임, 친구 추가할 유저 닉네임' })
  @ApiBody({ type: FriendDto1, description: '친구 추가할 유저 닉네임' })
  @Post()
  async createFriend(@Body() b: FriendDto1, @Req() req: Request){
    let user_id, friend;
    // user = await this.usersService.readUsers(b.user_nick, 'nick');
    user_id = await this.sessionService.readUserId(req.sessionID);
    friend = await this.usersService.readUsers(b.friend_nick, 'nick');
    return this.friendService.createFriend(user_id, friend.user_id);
    // return this.friendService.createFriend(b.user_id, b.friend_id);
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

  // @ApiOperation({ summary: '해당 유저를 친구 추가한 모든 유저 검색'})
  // @ApiResponse({ 
  //   // type: FriendDto2, 
  //   type: UsersDto5,
  //   description: `
  //     해당 유저를 친구 추가한 유저 객체 배열
  //     검색 실패시 실패 이유 반환
  //   ` })
  // @ApiQuery({ name: 'user_id', example: 'jinbkim', description: '자신을 친구 추가한 모든 유저들을 검색할 유저 아이디'})
  // @Get('list2')
  // readFriend2(@Query() q){
  //   return this.friendService.readFriend(q.user_id, 'receive');
  // }

  @ApiOperation({ summary: '해당 유저가 친구 추가한 유저 인지 확인'})
  @ApiResponse({ 
    type: Bool, 
    description: `
      이미 친구 추가한 유저 이면 true, 아니면 false
      확인 실패시 실패 이유 반환
    ` })
  // @ApiQuery({ name: 'user_id', example: 'jinbkim' ,description: 'friend인지 확인할 유저아이디' })
  // @ApiQuery({ name: 'friend_id', example: 'donglee' ,description: 'friend인지 확인할 상대아이디' })
  // @ApiQuery({ name: 'user_nick', example: 'jinbkim' ,description: 'friend인지 확인할 유저 닉네임' })
  @ApiQuery({ name: 'friend_nick', example: 'donglee' ,description: 'friend인지 확인할 상대 닉네임' })
  @Get()
  async isFriend(@Query() q: FriendDto1, @Req() req: Request){
    let user_id, friend;
    // user = await this.usersService.readUsers(q.user_nick, 'nick');
    user_id = await this.sessionService.readUserId(req.sessionID);
    friend = await this.usersService.readUsers(q.friend_nick, 'nick');
    return this.friendService.isFriend(user_id, friend.user_id);
    // return this.friendService.isFriend(q.user_id, q.friend_id);
  }

  @ApiOperation({ summary: '친구 삭제'})
  @ApiResponse({ type: ErrMsgDto, description: 'friend 삭제 실패시 실패 이유' })
  // @ApiQuery({ name: 'user_id', example: 'jinbkim', description: '내 유저 아이디' })
  // @ApiQuery({ name: 'friend_id', example: 'donglee', description: '친구 삭제할 유저 아이디' })
  // @ApiQuery({ name: 'user_nick', example: 'jinbkim', description: '내 유저 닉네임' })
  @ApiQuery({ name: 'friend_nick', example: 'donglee', description: '친구 삭제할 유저 닉네임' })
  @Delete()
  async deleteFriend(@Query() q: FriendDto1, @Req() req: Request){
    let user_id, friend;
    // user = await this.usersService.readUsers(q.user_nick, 'nick');
    user_id = await this.sessionService.readUserId(req.sessionID);
    friend = await this.usersService.readUsers(q.friend_nick, 'nick');
    return this.friendService.deleteFriend(user_id, friend.user_id);
    // return this.friendService.deleteFriend(q.user_id, q.friend_id);
  }
  @ApiOperation({ 
    summary: `해당 유저 관련 모든 친구 관계 삭제`,
    description : `회원 탈퇴시 에만 사용됨`
  })
  @ApiResponse({ type: ErrMsgDto, description: `모든 친구 관계 삭제 실패시 실패 이유` })
  @ApiQuery({ name: 'user_id', example: 'jinbkim', description: '모든 친구 관계를 삭제할 유저 아이디' })
  @Delete('all')
  deleteAllFriend(@Req() req: Request){
    return this.friendService.deleteAllFriend(req.session.userid);
  } 
}