import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ban } from 'src/entities/ban';
import { Chat } from 'src/entities/chat';
import { Users } from 'src/entities/users';
import { Repository } from 'typeorm';

@Injectable()
export class BanService {
  constructor(
    @InjectRepository(Ban) private banRepo: Repository<Ban>,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    ){}

  async createBan(user_id: string, channel_id: number){
    if (await this.banRepo.count({user_id: user_id, channel_id: channel_id}))  // 이미 채널의 ban 이라면
      return false;
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널 이라면
      return false;
    await this.banRepo.save({user_id: user_id, channel_id: channel_id})
    return true;
  }

  async readBan(channel_id: number){
    const channel = await this.banRepo.find({channel_id: channel_id});  // 해당 채널 검색
    let bans: Array<string> = [];
    for(var i in channel)
      bans[i] = channel[i].user_id;
    return bans;
  }

  async isBan(user_id: string, channel_id: number){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    if (await this.banRepo.count({user_id: user_id, channel_id: channel_id}))
      return true;
    else
      return false;
  }

  async deleteBan(user_id: string, channel_id: number){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    if (await this.banRepo.count({ user_id: user_id, channel_id: channel_id }) === 0)  // 유저가 ban이 아니면
      return false;
    this.banRepo.delete({ user_id: user_id, channel_id: channel_id });
    return true;
  }  
  async deleteAllBan(user_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    this.banRepo.delete({ user_id: user_id});
    return true;
  }  
}
