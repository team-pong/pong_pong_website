import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin';
import { Ban } from 'src/entities/ban';
import { Chat } from 'src/entities/chat';
import { ChatUsers } from 'src/entities/chat-users';
import { Users } from 'src/entities/users';
import { err0, err1, err2, err3, err4, err5 } from 'src/err';
import { Repository } from 'typeorm';

@Injectable()
export class BanService {
  constructor(
    @InjectRepository(Ban) private banRepo: Repository<Ban>,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(ChatUsers) private chatUsersRepo: Repository<ChatUsers>,
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,

    ){}

  async createBan(user_id: string, channel_id: number){
    if (await this.banRepo.count({user_id: user_id, channel_id: channel_id}))  // 이미 채널의 ban 이라면
      return err1;
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return err2;
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널 이라면
      return err4;
    if (await this.chatUsersRepo.count({user_id: user_id, channel_id: channel_id}) === 0)  // 해당 채널에 유저가 없다면
      return err3;
    if (await this.adminRepo.count({user_id: user_id, channel_id: channel_id}))  // 해당 유저가 admin 이면
      return err5;
    await this.banRepo.save({user_id: user_id, channel_id: channel_id})
    return err0;
  }

  async isBan(user_id: string, channel_id: number){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return err2;
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널 이라면
      return err4;
    if (await this.banRepo.count({user_id: user_id, channel_id: channel_id}) === 0)  // ban 당하지 않았 으면
      return false;
    const ban = await this.banRepo.find({user_id: user_id, channel_id: channel_id});
    const banTime = ban[0].createdAt;
    banTime.setSeconds(banTime.getSeconds() + 60);
    if (banTime < new Date()){  // ban 당한지 60초가 넘었으면
      await this.banRepo.delete({user_id: user_id, channel_id: channel_id});
      return false;
    }
    else
      return true;
  }

  async deleteBan(user_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return err2;
    await this.banRepo.delete({user_id: user_id});
    return err0;
  }  
}