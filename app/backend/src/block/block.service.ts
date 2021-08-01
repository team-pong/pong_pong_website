import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Block } from 'src/entities/block';
import { Friend } from 'src/entities/friend';
import { Users } from 'src/entities/users';
import { Repository } from 'typeorm';

@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(Block) private blockRepo: Repository<Block>,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
    @InjectRepository(Friend) private FriendRepo: Repository<Friend>,
  ){}
  
  async createBlock(user_id: string, block_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    if (await this.usersRepo.count({user_id: block_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    if (await this.blockRepo.count({user_id: user_id, block_id: block_id}))  // 이미 차단 했으면
      return false;
    await this.blockRepo.save({user_id: user_id, block_id: block_id});
    if (await this.FriendRepo.count({user_id: user_id, friend_id:block_id}))  // 친구인 상태이면, 친구 삭제
      this.FriendRepo.delete({user_id: user_id, friend_id: block_id});
    return true;
  }

  async readBlock(user_id: string){
    const user = await this.blockRepo.find({user_id: user_id});  // 해당 유저의 차단 목록 검색
    let blockList = { blockList: Array<string>() };
    for (var i in user)
      blockList.blockList[i] = user[i].block_id;
    return blockList;
  }

  async isBlock(user_id: string, block_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    if (await this.usersRepo.count({user_id: block_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    if (await this.blockRepo.count({user_id: user_id, block_id: block_id}))  // 이미 차단 했으면
      return true;
    return false;
  }

  async deleteBlock(user_id: string, block_id: string){
    if (await this.isBlock(user_id, block_id)){  // 이미 차단 했으면
      await this.blockRepo.delete({user_id: user_id, block_id: block_id});
      return true;
    }
    return false;
  }
}