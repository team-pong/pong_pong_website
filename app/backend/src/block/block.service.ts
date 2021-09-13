import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersDto3 } from 'src/dto/users';
import { Bool, ErrMsgDto } from 'src/dto/utility';
import { Block } from 'src/entities/block';
import { Friend } from 'src/entities/friend';
import { Users } from 'src/entities/users';
import { err0, err1, err2, err3 } from 'src/err';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class BlockService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @InjectRepository(Block) private blockRepo: Repository<Block>,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
    @InjectRepository(Friend) private FriendRepo: Repository<Friend>,
  ){}
  
  async createBlock(user_id: string, block_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    if (await this.usersRepo.count({user_id: block_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    if (await this.blockRepo.count({user_id: user_id, block_id: block_id}))  // 이미 차단 했으면
      return new ErrMsgDto(err1);;
    await this.blockRepo.save({user_id: user_id, block_id: block_id});
    if (await this.FriendRepo.count({user_id: user_id, friend_id:block_id}))  // 친구인 상태이면, 친구 삭제
      await this.FriendRepo.delete({user_id: user_id, friend_id: block_id});
    return new ErrMsgDto(err0);
  }

  async readBlock(user_id: string){

    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    let user;
    user = await this.blockRepo.find({user_id: user_id});  // 해당 유저의 차단 목록 검색
    // let blockList = { blockList: Array<string>() };
    let blockList = { blockList: Array<UsersDto3>() };
    for (var i in user)
      // blockList.blockList[i] = user[i].block_id;
      blockList.blockList[i] = await this.usersService.readUsers(user[i].block_id, 'user_id');
    return blockList;
  }

  async isBlock(user_id: string, block_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    if (await this.usersRepo.count({user_id: block_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    if (await this.blockRepo.count({user_id: user_id, block_id: block_id}))  // 이미 차단 했으면
      return new Bool(true);
    return new Bool(false);
  }

  async deleteBlock(user_id: string, block_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    if (await this.usersRepo.count({user_id: block_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    if (await this.isBlock(user_id, block_id)){  // 차단이 되어 있으면
      await this.blockRepo.delete({user_id: user_id, block_id: block_id});
      return new ErrMsgDto(err0);
    }
    return new ErrMsgDto(err3);
  }

  async deleteAllBlock(user_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    await this.blockRepo.delete({user_id: user_id});
    await this.blockRepo.delete({block_id: user_id});
    return new ErrMsgDto(err0);
  }
}