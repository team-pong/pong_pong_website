import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bool, ErrMsgDto } from 'src/dto/utility';
import { Friend } from 'src/entities/friend';
import { Users } from 'src/entities/users';
import { err0, err16, err17, err2, err25} from 'src/err';
import { Repository } from 'typeorm';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend) private friendRepo: Repository<Friend>,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
  ){}
  
  async createFriend(user_id: string, friend_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    if (await this.usersRepo.count({user_id: friend_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    if (await this.friendRepo.count({user_id: user_id, friend_id: friend_id}))  // 이미 친구 이면
      return new ErrMsgDto(err16);
    await this.friendRepo.save({user_id: user_id, friend_id: friend_id});
    return new ErrMsgDto(err0);
  }

  async readFriend(user_id: string, type: string){
    if (user_id === err25)
      return new ErrMsgDto(err25);
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    let user;
    let friendList = { friendList: Array<string>() };
    if (type === 'send'){
      user = await this.friendRepo.find({user_id: user_id});  // 해당 유저의 모든 친구 검색
      for (var i in user)
        friendList.friendList[i] = user[i].friend_id;
    }
    else if (type === 'receive'){
      user = await this.friendRepo.find({friend_id: user_id});  // 해당 유저를 친구 추가한 모든 유저 검색
      for (var i in user)
        friendList.friendList[i] = user[i].user_id;
    }
    return friendList;
  }
  async isFriend(user_id: string, friend_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    if (await this.usersRepo.count({user_id: friend_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    if (await this.friendRepo.count({user_id: user_id, friend_id: friend_id}))  // 이미 친구 이면
      return new Bool(true);
    return new Bool(false);
  }

  async deleteFriend(user_id: string, friend_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2)
    if (await this.usersRepo.count({user_id: friend_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    if (await this.isFriend(user_id, friend_id)){  // 이미 친구 이면
      await this.friendRepo.delete({user_id: user_id, friend_id: friend_id});
      return new ErrMsgDto(err0);
    }
    return new ErrMsgDto(err17);
  }
  async deleteAllFriend(user_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    await this.friendRepo.delete({user_id: user_id});
    await this.friendRepo.delete({friend_id: user_id});
    return new ErrMsgDto(err0);
  }
}