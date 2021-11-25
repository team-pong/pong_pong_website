import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionsDto2, QuestionsDto3, QuestionsDto4 } from 'src/dto/questions';
import { ErrMsgDto } from 'src/dto/utility';
import { Questions } from 'src/entities/questions';
import { Users } from 'src/entities/users';
import { err0, err2, err29 } from 'src/err';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { transportOption } from 'src/mail/mailer.option';
import { SessionService } from 'src/session/session.service';

@Injectable()
export class QuestionsService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => SessionService))
    private sessionService: SessionService,
    @InjectRepository(Questions) private QuestionsRepo: Repository<Questions>,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
  ) {}

  async creatQuestions(user_id: string, title: string, email: string, content: string) {
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않는 유저 이면
      return new ErrMsgDto(err2);
    await this.QuestionsRepo.save({user_id: user_id, title: title, email:email, content: content, answer: ""})
    return new ErrMsgDto(err0);
  }

  async readAllBeforeAnswerQuestions() {
    let questions = await this.QuestionsRepo.find();  // 모든 문의사항
    let questionsList = Array<QuestionsDto2>();
    let user;
    let idx = -1;
    // 문의사항의 아이디, 제목, 닉네임, 문의시간만 담기
    for(var i in questions) {
      if (questions[i].answer != "")  // 답변된 문의사항 이면
        continue ;
      questionsList.push(new QuestionsDto2());
      questionsList[++idx].question_id = questions[i].question_id;
      questionsList[idx].title = questions[i].title;
      user = await this.usersService.readUsers(questions[i].user_id, 'user_id');
      questionsList[idx].nick = user["nick"];
      questionsList[idx].question_time = questions[i].question_time;
    }
    return questionsList;
  }

  async readAllAfterAnswerQuestions() {
    let questions = await this.QuestionsRepo.find();  // 모든 문의사항
    let questionsList = Array<QuestionsDto2>();
    let user;
    let idx = -1;
    // 문의사항의 아이디, 제목, 닉네임, 문의시간만 담기
    for(var i in questions) {
      if (questions[i].answer == "")  // 답변안된 문의사항 이면
        continue ;
        //console.log("id : ", questions[i].question_id);
      questionsList.push(new QuestionsDto2());
      questionsList[++idx].question_id = questions[i].question_id;
      questionsList[idx].title = questions[i].title;
      user = await this.usersService.readUsers(questions[i].user_id, 'user_id');
      questionsList[idx].nick = user["nick"];
      questionsList[idx].question_time = questions[i].question_time;
    }
    return questionsList;
  }

  async readOneQuestion(question_id: number) {
    if (await this.QuestionsRepo.count({question_id: question_id}) === 0)  // 존재하지 않은 문의사항이면
      return new ErrMsgDto(err29);

    let oneQuestion = await this.QuestionsRepo.findOne({question_id: question_id});
    let question = new QuestionsDto4;
    let user;
    question.question_id = oneQuestion.question_id;
    user = await this.usersService.readUsers(oneQuestion.user_id, 'user_id');
    question.nick = user["nick"];
    question.title = oneQuestion.title;
    question.email = oneQuestion.email;
    question.content = oneQuestion.content;
    question.answer = oneQuestion.answer;
    question.question_time = oneQuestion.question_time;
    question.answer_time = oneQuestion.answer_time;
    return question;
  }

  async answerQuestion(question_id: number, answer: string) {
    if (await this.QuestionsRepo.count({question_id: question_id}) === 0)  // 존재하지 않은 문의사항이면
      return new ErrMsgDto(err29);
    
    await this.QuestionsRepo.update({question_id: question_id}, {answer: answer, answer_time: new Date()});
    return new ErrMsgDto(err0);
  }

  // email 주소로 메일 보내기
  async reply(sender_id: string, email: string, content: string) {
    if (!await this.sessionService.isAdmin(sender_id)) {
      throw {err_msg: "답변 권한이 없습니다."};
    }
    const transporter = nodemailer.createTransport(transportOption);
    await transporter.sendMail({
      from: `"${sender_id}" <${process.env.EMAIL_ID}>`,
      to: email,
      subject: '문의사항 답변',
      html: `<b>${content}</b>`,
    })
  }

  async deleteQuestion(user_id: string, question_id: number) {
    if (!await this.sessionService.isAdmin(user_id)) {
      throw {err_msg: "삭제 권한이 없습니다."};
    }
    await this.QuestionsRepo.delete({question_id: question_id});
  }
}
