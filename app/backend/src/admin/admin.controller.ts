import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { boolean, string } from 'joi';
import { AdminDto1, AdminDto2 } from 'src/dto/admin';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService){}

  @ApiOperation({ summary: 'admin 설정'})
  @ApiResponse({ type: string, description: 'admin 설정 실패시 실패 이유' })
  @ApiBody({ type: AdminDto1, description: 'admin 설정할 채널아이디, 유저아이디' })
  @Post()
  createAdmin(@Body() b: AdminDto1){
    return this.adminService.createAdmin(b.user_id, b.channel_id);
  }

  @ApiOperation({ summary: '해당 채널의 admin 검색'})
  @ApiResponse({ 
    type: AdminDto2, 
    description: `
      해당 채널의 admin 유저아이디 배열
      검색 실패시 실패 이유 반환
    `})
  @ApiQuery({ name: 'channel_id', example: 1, description: 'admin을 검색할 채널아이디' })
  @Get()
  readAdmin(@Query() q){
    return this.adminService.readAdmin(q.channel_id);
  }
  @ApiOperation({ summary: '해당 유저가 해당 채널의 admin 인지 확인'})
  @ApiResponse({ 
    type: boolean, 
    description: `
      유저가 admin 이면 true, 아니면 false
      확인 실패시 실패 이유 반환
    `})
  @ApiQuery({ name:'user_id', example: 'jinbkim', description: 'admin인지 확인할 유저아이디' })
  @ApiQuery({ name:'channel_id', example: 1, description: 'admin인지 확인할 채널아이디' })
  @Get('isAdmin')
  isAdmin(@Query() q){
    return this.adminService.isAdmin(q.user_id, q.channel_id);
  }

  @ApiOperation({ summary: '해당 유저의 admin 제거'})
  @ApiResponse({ type: string, description: 'admin 제거 실패시 실패 이유' })
  @ApiQuery({ name:'user_id', example: 'jinbkim', description: 'admin 제거할 유저아이디' })
  @Delete()
  deleteAdmin(@Query() q){
    return this.adminService.deleteAdmin(q.user_id);
  }
}
