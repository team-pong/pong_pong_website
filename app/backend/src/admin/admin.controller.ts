import { Body, Controller, Delete, forwardRef, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminDto1 } from 'src/dto/admin';
import { UsersDto5 } from 'src/dto/users';
import { Bool, ErrMsgDto } from 'src/dto/utility';
import { UsersService } from 'src/users/users.service';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    ){}

  @ApiOperation({ summary: 'admin 설정'})
  @ApiResponse({ type: ErrMsgDto, description: 'admin 설정 실패시 실패 이유' })
  // @ApiBody({ type: AdminDto1, description: 'admin 설정할 채널아이디, 유저아이디' })
  @ApiBody({ type: AdminDto1, description: 'admin 설정할 채널아이디, 유저닉네임' })
  @Post()
  async createAdmin(@Body() b: AdminDto1){
    let user;
    user = await this.usersService.readUsers(b.nick, 'nick');
    return await this.adminService.createAdmin(user.user_id, b.channel_id);
    // return this.adminService.createAdmin(b.user_id, b.channel_id);
  }

  @ApiOperation({ summary: '해당 채널의 admin 검색'})
  @ApiResponse({ 
    type: UsersDto5, 
    description: `
      해당 채널의 admin 유저객체 배열
      검색 실패시 실패 이유 반환
    `})
  @ApiQuery({ name: 'channel_id', example: 1, description: 'admin을 검색할 채널아이디' })
  @Get()
  readAdmin(@Query() q){
    return this.adminService.readAdmin(q.channel_id);
  }
  @ApiOperation({ summary: '해당 유저가 해당 채널의 admin 인지 확인'})
  @ApiResponse({ 
    type: Bool,
    description: `
      유저가 admin 이면 true, 아니면 false
      확인 실패시 실패 이유 반환
    `})
  // @ApiQuery({ name:'user_id', example: 'jinbkim', description: 'admin인지 확인할 유저아이디' })
  @ApiQuery({ name:'nick', example: 'jinbkim', description: 'admin인지 확인할 유저닉네임' })
  @ApiQuery({ name:'channel_id', example: 1, description: 'admin인지 확인할 채널아이디' })
  @Get('isAdmin')
  async isAdmin(@Query() q){
    let user;
    user = await this.usersService.readUsers(q.nick, 'nick');
    return await this.adminService.isAdmin(q.nick, q.channel_id);
    // return await this.adminService.isAdmin(q.user_id, q.channel_id);
  }

  @ApiOperation({ summary: '해당 유저의 admin 제거'})
  @ApiResponse({ type: ErrMsgDto, description: 'admin 제거 실패시 실패 이유' })
  // @ApiQuery({ name:'user_id', example: 'jinbkim', description: 'admin 제거할 유저아이디' })
  @ApiQuery({ name:'nick', example: 'jinbkim', description: 'admin 제거할 유저 닉네임' })
  @Delete()
  async deleteAdmin(@Query() q){
    let user;
    user = await this.usersService.readUsers(q.nick, 'nick');
    return await this.adminService.deleteAdmin(user.user_id);
    // return this.adminService.deleteAdmin(q.user_id);
  }
}
