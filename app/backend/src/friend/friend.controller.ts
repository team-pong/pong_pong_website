import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { boolean } from 'joi';
import { FriendDto1, FriendDto2, FriendDto3 } from 'src/dto/friend';
import { FriendService } from './friend.service';

@ApiTags('Friend')
@Controller('friend')
export class FriendController {
  constructor(private friendService: FriendService){}

  @ApiOperation({ summary: '친구 추가'})
  @ApiResponse({ type: boolean, description: '친구 추가 성공시 true, 실패시 false' })
  @ApiBody({ type: FriendDto1, description: '내 유저 아이디, 친구 추가할 유저 아이디' })
  @Post()
  createFriend(@Body() b: FriendDto1){
    return this.friendService.createFriend(b.user_id, b.friend_id);
  }

  @ApiOperation({ summary: '해당 유저의 모든 친구 검색'})
  @ApiResponse({ type: FriendDto2, description: '해당 유저의 친구 유저 아이디 배열' })
  @ApiBody({ type: FriendDto3, description: '모든 친구들 검색할 유저 아이디 ' })
  @Get('send')
  readFriend1(@Body() b: FriendDto3){
    return this.friendService.readFriend1(b.user_id);
  }
  @ApiOperation({ summary: '해당 유저를 친구 추가한 모든 유저 검색'})
  @ApiResponse({ type: FriendDto2, description: '해당 유저를 친구 추가한 유저 아이디 배열' })
  @ApiBody({ type: FriendDto3, description: '친구 유저 아이디'})
  @Get('receive')
  readFriend2(@Body() b: FriendDto3){
    return this.friendService.readFriend2(b.user_id);
  }
  @ApiOperation({ summary: '해당 유저가 친구 추가한 유저 인지 확인'})
  @ApiResponse({ type: boolean, description: '이미 친구 추가한 유저 이면 true, 아니면 false' })
  @ApiBody({ type: FriendDto1, description: 'friend인지 확인할 유저아이디, 채널아이디' })
  @Get()
  isFriend(@Body() b: FriendDto1){
    return this.friendService.isFriend(b.user_id, b.friend_id);
  }

  @ApiOperation({ summary: '친구 삭제'})
  @ApiResponse({ type: boolean, description: 'friend 삭제 성공시 true, 실패시 false' })
  @ApiBody({ type: FriendDto1, description: '내 유저 아이디, 친구 삭제할 유저 아이디' })
  @Delete()
  deleteFriend(@Body() b: FriendDto1){
    return this.friendService.deleteFriend(b.user_id, b.friend_id);
  } 
}

