import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersDto3, UsersDto5 } from 'src/dto/users';
import { Bool, ErrMsgDto } from 'src/dto/utility';
import { Admin } from 'src/entities/admin';
import { Chat } from 'src/entities/chat';
import { Users } from 'src/entities/users';
import { err0, err11, err2, err4, err5 } from 'src/err';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    ){}

  async createAdmin(user_id: string, channel_id: number){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널 이라면
      return new ErrMsgDto(err4);
    if (await this.adminRepo.count({user_id: user_id, channel_id: channel_id}))  // 이미 채널의 관리자 라면
      return new ErrMsgDto(err5);
    await this.adminRepo.save({user_id: user_id, channel_id: channel_id})
    return new ErrMsgDto(err0);;
  }

  async readAdmin(channel_id: number){
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널 이라면
      return new ErrMsgDto(err4);;
    const channel = await this.adminRepo.find({channel_id: channel_id});  // 해당 채널 검색

    let adminList;
    adminList = { adminList: Array<UsersDto3>() }
    for (var i in channel)
      adminList.adminList[i] = await this.usersService.readUsers(channel[i].user_id, 'user_id');
    return adminList;
    
    // let adminList = { adminList: Array<string>() }
    // for(var i in channel)
    //   adminList.adminList[i] = channel[i].user_id;
    // return adminList;
  }
  async isAdmin(user_id: string, channel_id: number){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);;
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널 이라면
      return new ErrMsgDto(err4);
    if (await this.adminRepo.count({user_id: user_id, channel_id: channel_id}))
      return new Bool(true);
    else
      return new Bool(false);
  }

  async deleteAdmin(user_id: string, channel_id: number){
    if (await this.adminRepo.count({user_id: user_id}) === 0)  // 유저가 admin이 아니면
      return new ErrMsgDto(err11);
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널 이라면
      return new ErrMsgDto(err4);
    await this.adminRepo.delete({user_id: user_id, channel_id: channel_id});
    return new ErrMsgDto(err0);
  }

  async deleteAllAdmin(user_id: string){
    if (await this.adminRepo.count({user_id: user_id}) === 0)  // 유저가 admin이 아니면
      return new ErrMsgDto(err11);
    await this.adminRepo.delete({user_id: user_id});
    return new ErrMsgDto(err0);
  }
}