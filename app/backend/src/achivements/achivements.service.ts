import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Achievements } from 'src/entities/achievements';
import { Users } from 'src/entities/users';
import { Repository } from 'typeorm';

@Injectable()
export class AchivementsService {	
  constructor(
  @InjectRepository(Achievements) private achievementRepo: Repository<Achievements>,
  @InjectRepository(Users) private usersRepo: Repository<Users>,
  ){}

  async createAchievements(user_id: string, achievement:string){
    if (await this.achievementRepo.count({ user_id: user_id,  achievement: achievement}))  // 유저가 이미 칭호가 추가되어 있다면
      return false;
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    await this.achievementRepo.save({ user_id: user_id, achievement: achievement });
    return true;
  }

  async readAchievements(user_id: string){
    const user = await this.achievementRepo.find({user_id: user_id});  // 해당 유저 찾기
    let achievements = { achievements: Array<string>() } 
    for(var i in user)
      achievements.achievements[i] = user[i].achievement;
    return achievements;
  }

  async deleteAchievements(user_id: string, achievement:string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    if (await this.achievementRepo.count({ user_id: user_id,  achievement: achievement}) === 0)  // 유저가 해당 칭호를 가지고 있지 않다면 
      return false;
    this.achievementRepo.delete({ user_id: user_id,  achievement: achievement});
    return true;
  }
  async deleteAllAchievements(user_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    await this.achievementRepo.delete({user_id: user_id});
    return true;
  }
}