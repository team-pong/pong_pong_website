import { Body, Controller, Delete, forwardRef, Get, Inject, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { DeleteQuestionDto, QuestionsDto1, QuestionsDto2, QuestionsDto4, QuestionsDto5, ReplyDto } from 'src/dto/questions';
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

  @ApiOperation({ summary: '모든 답변 전 문의 사항 검색' })
  @ApiResponse({ type: [QuestionsDto2], description: '모든 답변 전 문의 사항 리스트' })
  @Get('beforeAnswerQuestions')
  async readAllBeforeAnswerQuestions() {
    return this.questionsSerive.readAllBeforeAnswerQuestions();
  }

  @ApiOperation({ summary: '모든 답변 한 문의 사항 검색' })
  @ApiResponse({ type: [QuestionsDto2], description: '모든 답변 한 문의 사항 리스트' })
  @Get('afterAnswerQuestions')
  async readAllAfterAnswerQuestions() {
    return this.questionsSerive.readAllAfterAnswerQuestions();
  }

  @ApiOperation({ summary: '문의 사항 1개 검색' })
  @ApiResponse({
    type: QuestionsDto4,
    description: `
    문의 사항 아이디, 닉네임, 제목, 유저 이메일, 내용, 답변 내용, 문의 시간, 답변 시간
    답변이 아직 안되였다면 답변 내용은 비어있고 문의 시간과 답변 시간이 같음
    ` })
  @ApiQuery({ name: 'question_id', example: '1', description: '검색할 문의 사항 아이디' })
  @Get('oneQuestion')
  async readOneQuestion(@Query() q) {
    return this.questionsSerive.readOneQuestion(q.question_id);
  }

  @ApiOperation({ summary: '문의 사항 답변' })
  @ApiResponse({ type: ErrMsgDto, description: '문의 사항 답변 실패시 실패 이유' })
  @ApiBody({ type: QuestionsDto5, description: '문의 사항 아이디, 답변 내용' })
  @Post('answer')
  async answerQuestion(@Body() b: QuestionsDto5) {
    return this.questionsSerive.answerQuestion(b.question_id, b.answer);
  }

  @ApiOperation({ summary: '문의 사항 제거' })
  @ApiResponse({ type: ErrMsgDto, description: '에러 객체' })
  @ApiBody({ type: DeleteQuestionDto, description: '문의 사항 아이디' })
  @Delete('')
  async deleteQuestion(@Body() b: DeleteQuestionDto, @Req() req: Request) {
    try {
      await this.questionsSerive.deleteQuestion(req.session.userid, b.question_id);
      return {};
    } catch (err) {
      return (err);
    }
  }
}
