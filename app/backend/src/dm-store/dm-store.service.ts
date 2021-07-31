import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DmStoreDto2 } from 'src/dto/dm-store';
import { DmStore } from 'src/entities/dm-store';
import { Users } from 'src/entities/users';
import { Repository } from 'typeorm';

@Injectable()
export class DmStoreService {
  constructor(
    @InjectRepository(DmStore) private dmStoreRepo: Repository<DmStore>,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
    ){}

  async createDmStore(sender_id: string, receiver_id: string, content: string){
    if (await this.usersRepo.count({user_id: sender_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    if (await this.usersRepo.count({user_id: receiver_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    await this.dmStoreRepo.save({sender_id: sender_id, receiver_id: receiver_id, content: content});
    return true;
  }

  async readDmStore(user_id: string, other_id: string){
    // user_id와 other_id가 관련된 모든 dm 검색
    const dm = await this.dmStoreRepo
      .query(`SELECT * FROM dm_store WHERE (sender_id='${user_id}' AND receiver_id='${other_id}') OR (sender_id='${other_id}' AND receiver_id='${user_id}') ORDER BY "createdAt" DESC`);
    // dm 보낸 유저 아이디, 받은 유저 아이디, 내용, 보낸 시각 데이터 들을 dmList에 담기
      let dmList = {dmList: Array<DmStoreDto2>()}
    for (var i in dm){
      dmList.dmList.push(new DmStoreDto2());
      dmList.dmList[i].sender_id = dm[i].sender_id;
      dmList.dmList[i].receiver_id = dm[i].receiver_id;
      dmList.dmList[i].content = dm[i].content;
      dmList.dmList[i].createdAt = dm[i].createdAt;
    }
    return dmList;
  }
}