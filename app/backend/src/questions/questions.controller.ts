import { Body, Controller, forwardRef, Get, Inject, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { QuestionsDto1, QuestionsDto2, QuestionsDto4, ReplyDto } from 'src/dto/questions';
import { ErrMsgDto } from 'src/dto/utility';
import { SessionService } from 'src/session/session.service';
import { QuestionsService } from './questions.service';
import { Request } from 'express';

@ApiTags('Questions')
@Controller('questions')
@UseGuards(new LoggedInGuard())
export class QuestionsController {
  constructor(
    private questionsSerive: QuestionsService,
    @Inject(forwardRef(() => SessionService))
    private sessionService: SessionService,
  ){}

  @ApiOperation({ summary: '문의 답변 보내기' })
  @ApiResponse({ type: ErrMsgDto, description: '답변 실패 이유' })
  @ApiBody({ type: ReplyDto, description: '문의 사항 제목, 유저 이메일, 문의 사항 내용' })
  @Post('reply')
  async sendReply(@Req() req: Request, @Body() body: ReplyDto) {
    try {
      this.questionsSerive.reply(req.session.userid, body.email, body.content);
      return {}
    } catch (err) {
      return (err);
    }
  }

  @ApiOperation({ summary: '문의 사항 생성' })
  @ApiResponse({ type: ErrMsgDto, description: '문의 사항 생성 실패시 실패 이유' })
  @ApiBody({ type: QuestionsDto1, description: '문의 사항 제목, 유저 이메일, 문의 사항 내용' })
  @Post()
  async creatQuestions(@Body() b: QuestionsDto1, @Req() req: Request) {
    let user_id;
    user_id = await this.sessionService.readUserId(req.sessionID);
    return this.questionsSerive.creatQuestions(user_id, b.title, b.email, b.content);
  }

  @ApiOperation({ summary: '모든 문의 사항 검색' })
  @ApiResponse({ type: [QuestionsDto2], description: '모든 문의 사항 리스트' })
  @Get()
  async readAllQuestions() {
    return this.questionsSerive.readAllQuestions();
  }

  @ApiOperation({ summary: '문의 사항 1개 검색' })
  @ApiResponse({ type: QuestionsDto4, description: '문의 사항 아이디, 닉네임, 제목, 유저 이메일, 내용' })
  @ApiQuery({ name: 'question_id', example:'1', description: '검색할 문의 사항 아이디' })
  @Get('oneQuestion')
  async readOneQuestion(@Query() q) {
    return this.questionsSerive.readOneQuestion(q.question_id);
  }  
}
