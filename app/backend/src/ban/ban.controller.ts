import { Controller, Post, Body, Get, Delete, Query, forwardRef, Inject, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BanService } from './ban.service';
import { BanDto1 } from 'src/dto/ban';
import { Bool, ErrMsgDto } from 'src/dto/utility';
import { UsersService } from 'src/users/users.service';
import { SessionService } from 'src/session/session.service';
import { ChatService } from 'src/chat/chat.service';
import { err27 } from 'src/err';
import { Request } from 'express';
import { AdminService } from 'src/admin/admin.service';
import { LoggedInGuard } from 'src/auth/logged-in.guard';

@ApiTags('Ban')
@Controller('ban')
@UseGuards(new LoggedInGuard())
export class BanController {
  constructor(
    private banService: BanService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => SessionService))
    private sessionService: SessionService,
    @Inject(forwardRef(() => ChatService))
    private chatService: ChatService,
    @Inject(forwardRef(() => AdminService))
    private adminService: AdminService,
    ){}

  @ApiOperation({ summary: 'ban 설정'})
  @ApiResponse({ type: ErrMsgDto, description: 'ban 설정 실패시 실패이유' })
  // @ApiBody({ type: BanDto1, description: 'ban 설정할 채널아이디, 유저아이디' })
  @ApiBody({ type: BanDto1, description: 'ban 설정할 채널아이디, 유저닉네임' })
  @Post()
  async createBan(@Body() b: BanDto1, @Req() req: Request){
    let user, user_id, owner, isAdmin;

    user_id = await this.sessionService.readUserId(req.sessionID);
    owner = await this.chatService.readOwner(b.channel_id);
    isAdmin = await this.adminService.isAdmin(user_id, b.channel_id);
    if (user_id != owner.user_id && !isAdmin.bool) // 사용자가 owner가 아니고, admin도 아니면
      return new ErrMsgDto(err27);

    user = await this.usersService.readUsers(b.nick, 'nick');
    return await this.banService.createBan(user.user_id, b.channel_id);
    // return this.banService.createBan(b.user_id, b.channel_id);
  }

  @ApiOperation({ 
    summary: '해당 유저가 해당 채널의 ban 인지 확인', 
    description: `
      ban 시간이 다지나면 ban 목록에서 지워짐
      확인 실패시 실패 이유 반환
    `})
  @ApiResponse({ type: Bool, description: '유저가 ban이면 true, 아니면 false' })
  // @ApiQuery({ name:'user_id', example: 'donglee', description: 'ban인지 확인할 유저아이디' })
  @ApiQuery({ name:'nick', example: 'donglee', description: 'ban인지 확인할 유저 닉네임' })
  @ApiQuery({ name:'channel_id', example: 2, description: 'ban인지 확인할 채널아이디' })
  @Get()
  async isBan(@Query() q: BanDto1){
    let user;
    user = await this.usersService.readUsers(q.nick, 'nick');
    return this.banService.isBan(user.user_id, q.channel_id);
  }

  // session 사용하는거로 바뀌면 DTO가 필요 없어질거같음
  @ApiOperation({ summary: '한 유저의 모든 ban 제거', description: '회원 탈퇴시 에만 사용됨'})
  @ApiResponse({ type: ErrMsgDto, description: 'ban 제거 실패시 실패이유' })
  @ApiQuery({ name: 'user_id', example: 'hna' ,description: 'ban 제거할 유저아이디' })
  @Delete()
  deleteBan(@Query() q){
    return this.banService.deleteBan(q.user_id);
  }
}