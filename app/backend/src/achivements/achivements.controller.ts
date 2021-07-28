import { Controller, Post, Body, Get, Delete } from '@nestjs/common';
import { AchivementsService } from './achivements.service'
import { AcievementDto1, AcievementDto2, AcievementDto3 } from '../dto/achivements'
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { boolean, number, string } from 'joi';

@ApiTags('Achivements')
@Controller('achivements')
export class AchivementsController {
  constructor(private achivementsService: AchivementsService){}

  // 유저칭호 추가
  @ApiResponse({ type: boolean, description: '칭호 추가 성공시 true, 실패시 false' })
  @ApiBody({ type: AcievementDto1, description: '칭호를 추가할 유저아이디, 칭호' })
  @Post()
  createchievements(@Body() b: AcievementDto1){
    return this.achivementsService.createAchievements(b.user_id, b.achievement);
  }

  // 유저칭호 검색
  @ApiResponse({ type: AcievementDto2, description: '유저의 칭호 배열' })
  @ApiBody({ type: AcievementDto3, description: '칭호를 검색할 유저아이디'})
  @Get()
  readAchievements(@Body() b: AcievementDto3){
    return this.achivementsService.readAchievements(b.user_id);
  }

  // 유저 칭호 1개 삭제
  @ApiResponse({ type: boolean, description: '칭호 삭제 성공시 true, 실패시 false' })
  @ApiBody({ type: AcievementDto1, description: '칭호를 삭제할 유저아이디, 칭호' })
  @Delete()
  deleteAchievements(@Body() b: AcievementDto1){
    return this.achivementsService.deleteAchievements(b.user_id, b.achievement);
  }
  
  // 한 유저의 칭호 모두 삭제
  @ApiResponse({ type: boolean, description: '칭호 삭제 성공시 true, 실패시 false' })
  @ApiBody({ type: AcievementDto3, description: '모든 칭호를 삭제할 유저아이디' })
  @Delete('all')
  deleteAllAchievements(@Body() b: AcievementDto3){
    return this.achivementsService.deleteAllAchievements(b.user_id);
  }
}
