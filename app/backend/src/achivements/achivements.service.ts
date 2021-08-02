import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Achievements } from 'src/entities/achievements';
import { Users } from 'src/entities/users';
import { Repository } from 'typeorm';
import { err0, err1, err2, err3 } from 'src/err'

@Injectable()
export class AchivementsService {	
  constructor(
  @InjectRepository(Achievements) private achievementRepo: Repository<Achievements>,
  @InjectRepository(Users) private usersRepo: Repository<Users>,
  ){}

  // async createAchievements(user_id: string, achievement:string){
  //   if (await this.achievementRepo.count({ user_id: user_id,  achievement: achievement}))  // 유저가 이미 칭호가 추가되어 있다면
  //     return err1;
  //   if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
  //     return err2;
  //   await this.achievementRepo.save({ user_id: user_id, achievement: achievement });
  //   return err0;
  // }

  async readAchievements(user_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return err2;
    await this.getAchievements(user_id);  // 칭호를 조회할 떄마다 칭호를 획득할수 있는지 확인
    const user = await this.achievementRepo.find({user_id: user_id});  // 해당 유저 찾기
    let achievementsList = { achievementsList: Array<string>() } 
    for(var i in user)
      achievementsList.achievementsList[i] = user[i].achievement;
    return achievementsList;
  }

  // async deleteAchievements(user_id: string, achievement:string){
  //   if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
  //     return err2;
  //   if (await this.achievementRepo.count({ user_id: user_id,  achievement: achievement}) === 0)  // 유저가 해당 칭호를 가지고 있지 않다면 
  //     return err3;
  //   await this.achievementRepo.delete({ user_id: user_id,  achievement: achievement});
  //   return err0;
  // }
  async deleteAllAchievements(user_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return err2;
    await this.achievementRepo.delete({user_id: user_id});
    return err0;
  }

  // 승수에 따른 칭호 획득
  async getAchievements(user_id: string){
    const user = await this.usersRepo.findOne({user_id: user_id});
    if (1 <= user.win_games && (await this.achievementRepo.count({user_id: user_id, achievement: '1 WIN'}) === 0))
      await this.achievementRepo.save({user_id: user_id, achievement: '1 WIN'});
    if (3 <= user.win_games && (await this.achievementRepo.count({user_id: user_id, achievement: '3 WIN'}) === 0))
      await this.achievementRepo.save({user_id: user_id, achievement: '3 WIN'});
    if (5 <= user.win_games && (await this.achievementRepo.count({user_id: user_id, achievement: '5 WIN'}) === 0))
      await this.achievementRepo.save({user_id: user_id, achievement: '5 WIN'});
    if (10 <= user.win_games && (await this.achievementRepo.count({user_id: user_id, achievement: '10 WIN'}) === 0))
      await this.achievementRepo.save({user_id: user_id, achievement: '10 WIN'});
    if (20 <= user.win_games && (await this.achievementRepo.count({user_id: user_id, achievement: '20 WIN'}) === 0))
      await this.achievementRepo.save({user_id: user_id, achievement: '20 WIN'});
    if (30 <= user.win_games && (await this.achievementRepo.count({user_id: user_id, achievement: '30 WIN'}) === 0))
      await this.achievementRepo.save({user_id: user_id, achievement: '30 WIN'});
    if (50 <= user.win_games && (await this.achievementRepo.count({user_id: user_id, achievement: '50 WIN'}) === 0))
      await this.achievementRepo.save({user_id: user_id, achievement: '50 WIN'});
    if (70 <= user.win_games && (await this.achievementRepo.count({user_id: user_id, achievement: '70 WIN'}) === 0))
      await this.achievementRepo.save({user_id: user_id, achievement: '70 WIN'});
    if (100 <= user.win_games && (await this.achievementRepo.count({user_id: user_id, achievement: '100 WIN'}) === 0))
      await this.achievementRepo.save({user_id: user_id, achievement: '100 WIN'});
  }
}