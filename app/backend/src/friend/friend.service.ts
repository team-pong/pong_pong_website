import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friend } from 'src/entities/friend';
import { Users } from 'src/entities/users';
import { Repository } from 'typeorm';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend) private friendRepo: Repository<Friend>,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
  ){}
  
  async createFriend(user_id: string, friend_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    if (await this.usersRepo.count({user_id: friend_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    if (await this.friendRepo.count({user_id: user_id, friend_id: friend_id}))  // 이미 친구 이면
      return false;
    await this.friendRepo.save({user_id: user_id, friend_id: friend_id});
    return true;
  }

  async readFriend1(user_id: string){
    const user = await this.friendRepo.find({user_id: user_id});  // 해당 유저의 모든 친구 검색
    let friendList = { friendList: Array<string>() };
    for (var i in user)
      friendList.friendList[i] = user[i].friend_id;
    return friendList;
  }
  async readFriend2(user_id: string){
    const user = await this.friendRepo.find({friend_id: user_id});  // 해당 유저를 친구 추가한 모든 유저 검색
    let friendList = { friendList: Array<string>() };
    for (var i in user)
      friendList.friendList[i] = user[i].user_id;
    return friendList;
  }
  async isFriend(user_id: string, friend_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    if (await this.usersRepo.count({user_id: friend_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    if (await this.friendRepo.count({user_id: user_id, friend_id: friend_id}))  // 이미 친구 이면
      return true;
    return false;
  }

  async deleteFriend(user_id: string, friend_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    if (await this.usersRepo.count({user_id: friend_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    if (await this.isFriend(user_id, friend_id)){  // 이미 친구 이면
      await this.friendRepo.delete({user_id: user_id, friend_id: friend_id});
      return true;
    }
    return false;
  }
  async deleteAllFriend(user_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    await this.friendRepo.delete({user_id: user_id});
    await this.friendRepo.delete({friend_id: user_id});
    return true;
  }
}