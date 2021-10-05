import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bool, ErrMsgDto } from 'src/dto/utility';
import { UsersDto3 } from 'src/dto/users';
import { Friend } from 'src/entities/friend';
import { Users } from 'src/entities/users';
import { err0, err1, err16, err17, err2, err25, err28, err3} from 'src/err';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { BlockService } from 'src/block/block.service';

@Injectable()
export class FriendService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => BlockService))
    private blockService: BlockService,
    
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

    if (user_id == friend_id)  // 자기자신을 추가할려 할때
      return new ErrMsgDto(err28);
    let isBlock;
    isBlock = await this.blockService.isBlock(user_id, friend_id);
    if (isBlock.bool)  // 이미 차단한 유저 이면
      return new ErrMsgDto(err1);
  
    await this.friendRepo.save({user_id: user_id, friend_id: friend_id});
    return new ErrMsgDto(err0);
  }

  async readFriend(user_id: string, type: string){
    if (user_id === err25)
      return new ErrMsgDto(err25);
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    let user;
    // let friendList = { friendList: Array<string>() };
    let friendList = { friendList: Array<UsersDto3>() }
    if (type === 'send'){
      user = await this.friendRepo.find({user_id: user_id});  // 해당 유저의 모든 친구 검색
      for (var i in user){
        // friendList.friendList[i] = user[i].friend_id;
        friendList.friendList[i] = await this.usersService.readUsers(user[i].friend_id, 'user_id');
      }
    }
    else if (type === 'receive'){
      user = await this.friendRepo.find({friend_id: user_id});  // 해당 유저를 친구 추가한 모든 유저 검색
      for (var i in user)
        // friendList.friendList[i] = user[i].user_id;
        friendList.friendList[i] = await this.usersService.readUsers(user[i].user_id, 'user_id');
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