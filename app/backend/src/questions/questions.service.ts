import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionsDto2, QuestionsDto3 } from 'src/dto/questions';
import { ErrMsgDto } from 'src/dto/utility';
import { Questions } from 'src/entities/questions';
import { Users } from 'src/entities/users';
import { err0, err2, err29 } from 'src/err';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class QuestionsService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @InjectRepository(Questions) private QuestionsRepo: Repository<Questions>,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
  ) {}

  async creatQuestions(user_id: string, title: string, email: string, content: string) {
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않는 유저 이면
      return new ErrMsgDto(err2);
    await this.QuestionsRepo.save({user_id: user_id, title: title, email:email, content: content})
    return new ErrMsgDto(err0);
  }

  async readAllQuestions() {
    let questions = await this.QuestionsRepo.find();  // 모든 문의사항
    let questionsList = { questionsList: Array<QuestionsDto2>() };
    let user;
    // 문의사항의 아이디, 제목, 닉네임만 담기
    for(var i in questions) {
      questionsList.questionsList.push(new QuestionsDto2());
      questionsList.questionsList[i].question_id = questions[i].question_id;
      questionsList.questionsList[i].title = questions[i].title;
      user = await this.usersService.readUsers(questions[i].user_id, 'user_id');
      questionsList.questionsList[i].nick = user["nick"];
    }
    return questionsList;
  }

  async readOneQuestion(question_id: number) {
    if (await this.QuestionsRepo.count({question_id: question_id}) === 0)  // 존재하지 않은 문의사항이면
      return new ErrMsgDto(err29);
    let question = await this.QuestionsRepo.findOne({question_id: question_id});
    return question;
  }
}
