import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin';
import { Chat } from 'src/entities/chat';
import { Users } from 'src/entities/users';
import { err0, err1, err2, err3, err4 } from 'src/err';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    ){}

  async createAdmin(user_id: string, channel_id: number){
    if (await this.adminRepo.count({user_id: user_id, channel_id: channel_id}))  // 이미 채널의 관리자 라면
      return err1;
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return err2;
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널 이라면
      return err4;
    await this.adminRepo.save({user_id: user_id, channel_id: channel_id})
    return err0;
  }

  async readAdmin(channel_id: number){
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널 이라면
      return err4;
    const channel = await this.adminRepo.find({channel_id: channel_id});  // 해당 채널 검색
    let adminList = { adminList: Array<string>() }
    for(var i in channel)
      adminList.adminList[i] = channel[i].user_id;
    return adminList;
  }
  async isAdmin(user_id: string, channel_id: number){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return err2;
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널 이라면
      return err4;
    if (await this.adminRepo.count({user_id: user_id, channel_id: channel_id}))
      return true;
    else
      return false;
  }

  async deleteAdmin(user_id: string){
    if (await this.adminRepo.count({user_id: user_id}) === 0)  // 유저가 admin이 아니면
      return err3;
    await this.adminRepo.delete({user_id: user_id});
    return err0;
  }
}