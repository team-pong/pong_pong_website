import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin';
import { Chat } from 'src/entities/chat';
import { Users } from 'src/entities/users';
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
      return false;
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널 이라면
      return false;
    await this.adminRepo.save({user_id: user_id, channel_id: channel_id})
    return true;
  }

  async readAdmin(channel_id: number){
    const channel = await this.adminRepo.find({channel_id: channel_id});  // 해당 채널 검색
    let admins = { admins: Array<string>() }
    for(var i in channel)
      admins.admins[i] = channel[i].user_id;
    return admins;
  }
  async isAdmin(user_id: string, channel_id: number){
    if (await this.adminRepo.count({user_id: user_id, channel_id: channel_id}))
      return true;
    else
      return false;
  }

  async deleteAdmin(user_id: string){
    if (await this.adminRepo.count({ user_id: user_id}) === 0)  // 유저가 admin이 아니면
      return false;
    this.adminRepo.delete({ user_id: user_id});
    return true;
  }
}
