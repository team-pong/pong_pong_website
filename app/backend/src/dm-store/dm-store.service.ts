import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DmStoreDto2 } from 'src/dto/dm-store';
import { DmStore } from 'src/entities/dm-store';
import { Users } from 'src/entities/users';
import { err0, err2 } from 'src/err';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

interface DM {
  target: {
    avatar_url: string,
    nick: string,
  },
  lastMsg: string,
  lastMsgTime: string,
}

export interface DMLog {
  time: string,
  msg: string,
  from: string,
}

@Injectable()
export class DmStoreService {
  constructor(
    @InjectRepository(DmStore) private dmStoreRepo: Repository<DmStore>,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    ){}

  async createDmStore(sender_id: string, receiver_id: string, content: string){
    if (await this.usersRepo.count({user_id: sender_id}) === 0)  // 존재하지 않은 유저 라면
      return err2;
    if (await this.usersRepo.count({user_id: receiver_id}) === 0)  // 존재하지 않은 유저 라면
      return err2;
    await this.dmStoreRepo.save({sender_id: sender_id, receiver_id: receiver_id, content: content});
    return err0;
  }

  async createInvite(from: string, to: string, inviteMsg: any) {
    console.log('invite dm saving...');
    const ret = await this.dmStoreRepo.save({sender_id: from, receiver_id: to, content: JSON.stringify(inviteMsg)})
    console.log(ret);
  }

  async readDmStore(user_id: string, other_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return err2;
    if (await this.usersRepo.count({user_id: other_id}) === 0)  // 존재하지 않은 유저 라면
      return err2;
    // user_id와 other_id가 관련된 모든 dm 검색
    const dms = await this.dmStoreRepo
      .query(`SELECT * FROM dm_store WHERE (sender_id='${user_id}' AND receiver_id='${other_id}') OR (sender_id='${other_id}' AND receiver_id='${user_id}') ORDER BY "created_at" DESC`);

    // dm 보낸 유저 아이디, 받은 유저 아이디, 내용, 보낸 시각 데이터 들을 dmList에 담기
    let dmList: DMLog[] = [];
    for (let dm of dms){
      dmList.push({
        time: dm.created_at,
        msg: dm.content,
        from: dm.sender_id == user_id ? "me" : dm.sender_id,
      });
    }
    return dmList;
  }

  /*!
   * DM 맨 처음 컴포넌트에서 가장 최근 메세지들의 목록이 나오는 화면
   * 
   */
  async getDmListOf(user_id: string) {
    // 1. 나랑 대화했던 상대방 목록 조회
    const recv_ids = await this.dmStoreRepo.query(`SELECT DISTINCT (sender_id) FROM dm_store WHERE (receiver_id='${user_id}')`);
    const send_ids = await this.dmStoreRepo.query(`SELECT DISTINCT (receiver_id) FROM dm_store WHERE (sender_id='${user_id}')`);

    let ret = [];
    const dm_list = [];

    // 2. 해당 유저랑 했던 대화중에서 가장 최근 메세지 1개씩만 가져오기
    for (let i of recv_ids) {
      const id = i.sender_id;
      const last_msg = await this.dmStoreRepo.query(`SELECT * FROM dm_store WHERE (sender_id='${id}' AND receiver_id='${user_id}') ORDER BY created_at DESC LIMIT 1`);
      ret.push(last_msg[0]);
    }

    for (let msg of ret) {
      dm_list.push({
        target: {
          avatar_url: await this.usersService.getAvatarUrl(msg.sender_id),
          nick: msg.sender_id,
        },
        lastMsg: msg.content,
        lastMsgTime: (msg.created_at),
      })
    }

    ret = [];

    for (let i of send_ids) {
      const id = i.receiver_id;
      const last_msg = await this.dmStoreRepo.query(`SELECT * FROM dm_store WHERE (sender_id='${user_id}' AND receiver_id='${id}') ORDER BY created_at DESC LIMIT 1`);
      ret.push(last_msg[0]);
    }

    for (let msg of ret) {
      dm_list.push({
        target: {
          avatar_url: await this.usersService.getAvatarUrl(msg.receiver_id),
          nick: msg.receiver_id,
        },
        lastMsg: msg.content,
        lastMsgTime: msg.created_at,
      })
    }

    // 3. 중복 타겟 제거
    const nums = [];
    for (let i = 0; i < dm_list.length; i++ ) {
      for (let j = i + 1; j < dm_list.length; j++ ) {
        if (dm_list[i].target.nick == dm_list[j].target.nick) {
          if (Date.parse(dm_list[i].lastMsgTime) < Date.parse(dm_list[j].lastMsgTime)) {
            nums.push(i);
          } else {
            nums.push(j);
          }
          continue ;
        } 
      }
    }

    for (let i = dm_list.length - 1; i >= 0; i--) {
      delete dm_list[nums[i]];
    }

    const filtered = dm_list.filter(function (el) {
      return el != null;
    });

    return filtered;
  }

  async deleteDmStore(user_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return err2;
    await this.dmStoreRepo.update({sender_id: user_id}, {sender_id: 'unknown'});
    await this.dmStoreRepo.update({receiver_id: user_id}, {receiver_id: 'unknown'});
    return err0;
  }
}