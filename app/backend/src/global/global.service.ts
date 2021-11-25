import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server } from 'socket.io';
import { Friend } from 'src/entities/friend';
import { SessionService } from 'src/session/session.service';
import { Repository } from 'typeorm';
import { GlobalGateway, socketMap } from './global.gateway';

@Injectable()
export class GlobalService {
  constructor(
    private sessionService: SessionService,
    @InjectRepository(Friend) private friendRepo: Repository<Friend>,
    private globalGateway: GlobalGateway,
  ) {}

  getSessionIDFromCookie(cookie): string {
    if (cookie) {
      return cookie.split('.')[1].substring(8);
    } else {
      throw 'empty cookie';
    }
  }
  
  getUserIdFromSessionId(session_id: string) {
    return this.sessionService.readUserId(session_id);
  }

  async emitStatusToOnlineFriends(status: string, user_id: string) {
    // 1. 나를 친구 추가한 사람들 중에서 online인 유저 ID 리스트 가져오기
    const friend_list = await this.friendRepo.query(
      `select (friend.user_id) from friend JOIN users ON friend."user_id"=users."user_id" WHERE (friend_id='${user_id}' and status!='offline')`
    );

    // 2. 소켓 메세지 전송
    for (let idx in friend_list) {
      this.globalGateway.server.to(socketMap[friend_list[idx].user_id]).emit(status, {user_id: user_id});
    }
  }
}