import { Body, Controller, Delete, forwardRef, Get, Inject, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminService } from 'src/admin/admin.service';
import { ChatService } from 'src/chat/chat.service';
import { MuteDto1 } from 'src/dto/mute';
import { Bool, ErrMsgDto } from 'src/dto/utility';
import { SessionService } from 'src/session/session.service';
import { UsersService } from 'src/users/users.service';
import { MuteService } from './mute.service';
import { Request } from 'express';
import { err27 } from 'src/err';
import { LoggedInGuard } from 'src/auth/logged-in.guard';

@ApiTags('Mute')
@Controller('mute')
@UseGuards(new LoggedInGuard())
export class MuteController {
  constructor(
    private muteService: MuteService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => SessionService))
    private sessionService: SessionService,
    @Inject(forwardRef(() => ChatService))
    private chatService: ChatService,
    @Inject(forwardRef(() => AdminService))
    private adminService: AdminService,

  ){}

  @ApiOperation({ summary: 'mute 설정'})
  @ApiResponse({ type: ErrMsgDto, description: 'mute 설정 실패시 실패 이유' })
  // @ApiBody({ type: MuteDto1, description: 'mute 설정할 채널아이디, 유저아이디' })
  @ApiBody({ type: MuteDto1, description: 'mute 설정할 채널아이디, 유저 닉네임' })
  @Post()
  async createMute(@Body() b: MuteDto1, @Req() req: Request){
    let user, user_id, owner, isAdmin;

    user_id = await this.sessionService.readUserId(req.sessionID);
    owner = await this.chatService.readOwner(b.channel_id);
    isAdmin = await this.adminService.isAdmin(user_id, b.channel_id);
    if (user_id != owner.user_id && !isAdmin.bool) // 사용자가 owner가 아니고, admin도 아니면
      return new ErrMsgDto(err27);

    user = await this.usersService.readUsers(b.nick, 'nick');
    return await this.muteService.createMute(user.user_id, b.channel_id);
    // return this.muteService.createMute(b.user_id, b.channel_id);
  }

  @ApiOperation({ summary: '해당 유저가 해당 채널의 mute 인지 확인', description: 'mute 시간이 다지나면 mute 목록에서 지워짐'})
  @ApiResponse({ 
    type: Bool, 
    description: `
      유저가 mute이면 true, 아니면 false
      확인 실패시 실패 이유
    ` })
  // @ApiQuery({ name: 'user_id', example: 'yochoi', description: 'mute인지 확인할 유저아이디' })
  @ApiQuery({ name: 'nick', example: 'yochoi', description: 'mute인지 확인할 유저닉네임' })
  @ApiQuery({ name: 'channel_id', example: 1, description: 'mute인지 확인할 채널아이디' })
  @Get()
  async isMute(@Query() q: MuteDto1){
    let user;
    user = await this.usersService.readUsers(q.nick, 'nick');
    return await this.muteService.isMute(user.user_id, q.channel_id);
    // return this.muteService.isMute(q.user_id, q.channel_id);
  }

  @ApiOperation({ summary: '한 유저의 모든 mute 제거', description: '회원 탈퇴시 에만 사용됨'})
  @ApiResponse({ type: ErrMsgDto, description: 'mute 제거 실패시 실패 이유' })
  @ApiQuery({ name: 'user_id', example: 'yochoi', description: 'mute 제거할 유저아이디' })
  @Delete()
  deletemute(@Req() req: Request){
    return this.muteService.deleteMute(req.session.userid);
  }
}