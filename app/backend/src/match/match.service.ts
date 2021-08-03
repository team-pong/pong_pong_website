import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchDto2 } from 'src/dto/match';
import { Match } from 'src/entities/match';
import { Users } from 'src/entities/users';
import { err0, err10, err2 } from 'src/err';
import { Repository } from 'typeorm';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match) private matchRepo: Repository<Match>,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
  ){}
  
  async createMatch(winner_id: string, loser_id: string, winner_score: number, loser_score: number, type: string, map: number){
    if (await this.usersRepo.count({user_id: winner_id}) === 0)  // 존재하지 않은 유저 라면
      return err2;
    if (await this.usersRepo.count({user_id: loser_id}) === 0)  // 존재하지 않은 유저 라면
      return err2;
    if (type != 'general' && type != 'ranked')  // 게임 타입이 일반게임 혹은 랭크게임이 아니면
      return err10;
    if (map != 1 && map != 2 && map != 3)  // 맵은 1, 2, 3 중에 하나 이어야함
      return err10;
    await this.matchRepo.save({winner_id: winner_id, loser_id: loser_id, winner_score: winner_score, loser_score: loser_score, type: type, map: map});
    const winner = await this.usersRepo.findOne({user_id: winner_id});
    const loser = await this.usersRepo.findOne({user_id: loser_id});
    await this.usersRepo.save({user_id: winner_id, total_games: winner.total_games+1, win_games: winner.win_games+1});  // 총게임수 +1, 승자는 1승추가
    await this.usersRepo.save({user_id: loser_id, total_games: loser.total_games+1, loss_games: loser.loss_games+1});  // 총게임수 +1, 패자는 1패추가
    if (type == 'ranked'){  // 랭크게임 이면
      const scoreChange = Math.abs(winner.ladder_level - loser.ladder_level)/10 + 10;
      await this.usersRepo.save({user_id: winner_id, ladder_level: winner.ladder_level+scoreChange});  // 승자는 +scoreChange점 
      await this.usersRepo.save({user_id: loser_id, ladder_level: loser.ladder_level-scoreChange});  // 패자는 -scoreChange점
    }
    return err0;
  }

  async readMatch(user_id: string, type: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return err2;
    let match;
    if (type === 'all')  // 해당 유저의 모든 전적 검색
      match = await this.matchRepo.query(`SELECT * FROM match WHERE winner_id='${user_id}' OR loser_id='${user_id}' ORDER BY "createdAt" DESC`);
    else if (type === 'general' || type === 'ranked')  // 해당 유저의 일반 전적 또는 래더 전적 검색
      match = await this.matchRepo.query(`SELECT * FROM match WHERE (winner_id='${user_id}' OR loser_id='${user_id}') AND type='${type}' ORDER BY "createdAt" DESC`);
    // 유저(아바타, nickname, 점수), 상대(아바타, nickname, 점수), 시간, 게임종류, 맵정보, 승패여부를 matchList에 담기
    let matchList = {matchList: Array<MatchDto2>()}
    for (var i in match){
      matchList.matchList.push(new MatchDto2());
      let user, other;
      if (user_id == match[i].winner_id){  // 유저가 이긴 게임이면
        user = await this.usersRepo.findOne({user_id: match[i].winner_id});
        other = await this.usersRepo.findOne({user_id: match[i].loser_id});
        matchList.matchList[i].user_score = match[i].winner_score;
        matchList.matchList[i].other_score = match[i].loser_score;
        matchList.matchList[i].isWin = true;
      }
      else{  // 유저가 진 게임이면
        user = await this.usersRepo.findOne({user_id: match[i].loser_id});
        other = await this.usersRepo.findOne({user_id: match[i].winner_id});
        matchList.matchList[i].user_score = match[i].loser_score;
        matchList.matchList[i].other_score = match[i].winner_score;
        matchList.matchList[i].isWin = false;
      }
      matchList.matchList[i].user_url = user.avatar_url;
      matchList.matchList[i].user_nick = user.nick;
      matchList.matchList[i].other_url = other.avatar_url;
      matchList.matchList[i].other_nick = other.nick;
      matchList.matchList[i].createdAt = match[i].createdAt;
      matchList.matchList[i].type = match[i].type;
      matchList.matchList[i].map = match[i].map;
    }
    return matchList;
  }

  async deleteMatch(user_id: string){
  if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
    return err2;
  await this.matchRepo.update({winner_id: user_id}, {winner_id: 'unknown'});
  await this.matchRepo.update({loser_id: user_id}, {loser_id: 'unknown'});
  return err0;
  }
}