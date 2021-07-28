import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { boolean } from 'joi';
import { AdminDto1, AdminDto2, AdminDto3, AdminDto4 } from 'src/dto/admin';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService){}

  // admin 설정
  @ApiResponse({ type: boolean, description: 'admin 설정 성공시 true, 실패시 false' })
  @ApiBody({ type: AdminDto1, description: 'admin 설정할 채널아이디, 유저아이디' })
  @Post()
  createAdmin(@Body() b: AdminDto1){
    return this.adminService.createAdmin(b.user_id, b.channel_id);
  }

  // admin 검색
  @ApiResponse({ type: AdminDto2, description: '해당 채널의 admin 유저아이디 배열' })
  @ApiBody({ type: AdminDto3, description: 'admin을 검색할 채널아이디' })
  @Get()
  readAdmin(@Body() b: AdminDto3){
    return this.adminService.readAdmin(b.channel_id);
  }
  // 해당 유저가 해당 채널의 admin 인지 확인
  @ApiResponse({ type: boolean, description: '유저가 admin 이면 true, 아니면 false' })
  @ApiBody({ type: AdminDto1, description: 'admin인지 확인할 유저아이디, 채널아이디' })
  @Get('isAdmin')
  isAdmin(@Body() b: AdminDto1){
    return this.adminService.isAdmin(b.user_id, b.channel_id);
  }

  // 해당 유저의 admin 제거
  @ApiResponse({ type: boolean, description: 'admin 제거 성공시 true, 실패시 false' })
  @ApiBody({ type: AdminDto4, description: 'admin 제거할 유저아이디' })
  @Delete()
  deleteAdmin(@Body() b: AdminDto1){
    return this.adminService.deleteAdmin(b.user_id);
  }
}
