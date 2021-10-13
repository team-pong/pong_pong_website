import { ConnectedSocket, MessageBody, OnGatewayDisconnect } from '@nestjs/websockets';
import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import axios from 'axios';
import { SessionService } from 'src/session/session.service';
import { FriendService } from 'src/friend/friend.service';
import { UsersDto3 } from 'src/dto/users';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from 'src/entities/users';
import { Friend } from 'src/entities/friend';
import { GlobalService } from './global.service';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DmStoreService } from 'src/dm-store/dm-store.service';
import { string } from 'joi';
import { UseGuards } from '@nestjs/common';
import { LoggedInWsGuard } from 'src/auth/logged-in.guard';

// key: user id / value: socket id
const socketMap = {};

interface DMSendMsg {
  to: string,
  msg: string,
}

// 3. dm 보내는 경우, dm 내용 db에 저장. 해당유저가 offline인 경우) db에 저장만 + 알람부분 col 추가?
//                                 online인 경우) 소켓으로 보냄
// 4. dm 받는 경우. online 상태에서) 소켓을 통해 받는다
//                oofline 상태에서) db를 통해 받는다? 아니면 소켓연결시 알람?
// 5. 게임중인 경우, 게임쪽에서 db 상태변경 + 소켓전송부분 추가해야함

function findUIDwithSID(sid: string) {
  for (let uid in socketMap) {
    if (socketMap[uid] == sid) {
      return uid;
    }
  }
}

@UseGuards(new LoggedInWsGuard())
@WebSocketGateway({ namespace: 'global'})
export class GlobalGateway {
  constructor(
    @InjectRepository(Users) private usersRepo: Repository<Users>,
    @InjectRepository(Friend) private friendRepo: Repository<Friend>,
    private sessionService: SessionService, // readUserId 함수 쓰려고 가져옴
    private friendService: FriendService,
    private globalService: GlobalService,
    private dmService: DmStoreService,
  ) {}

  @WebSocketServer() public server: Server;

  afterInit(server: any): any {
    console.log('Global WebSocket Server Init');
  }

  // 1. 로그인 한 경우 자기를 친구추가한 사람 중 온라인인 사람에게 online status 전송
  // 문제: 그 사람의 소켓을 어떻게 가져올것인가?
  // 해결: 소켓 연결시 소켓 맵에 저장
  async handleConnection(@ConnectedSocket() socket: Socket, data: string) {
    const sid: string = this.globalService.getSessionIDFromCookie(socket.request.headers.cookie);
    const userid = await this.sessionService.readUserId(sid);

    await this.usersRepo.update(userid, {status: 'online'});
    socketMap[userid] = socket.id;
    console.log('socket connected', sid, userid);
    const friend_list = await this.friendRepo.find({friend_id: userid});
    let friend_id: string = '';
    for (let i in friend_list) {
      console.log(i, friend_list[i]);
      friend_id = friend_list[i].user_id;
      this.server.to(socketMap[friend_id]).emit('online', {user_id: friend_id})
    }
    
  }

  /*!
   * @brief 사용자가 DM을 보내는 경우
   *        1. DB에 저장.
   *        2. 상대방이 온라인 상태라면 소켓으로도 전송.
  */
  @SubscribeMessage('dm')
  handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() body: DMSendMsg): any {
    const user_id = findUIDwithSID(socket.id);
    const target_id = body.to;
    this.dmService.createDmStore(user_id, target_id, body.msg);
    const target_sid = socketMap[target_id]
    if (target_sid) {
      this.server.to(target_sid).emit('dm', {
        from: user_id,
        msg: body.msg,
        time: Date.now(),
      })
    }
  }

  // 2) 로그아웃시 나를 친추한 사람의 소켓에 오프라인 메세지 전송
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log('disconnected', socket.nsp.name);

    // 1. 소켓맵에서 내 소켓 찾기
    const user_id = findUIDwithSID(socket.id);

    // 2. DB에서 내 상태를 offline으로 변경
    await this.usersRepo.update({user_id: user_id}, {status: 'offline'});

    // 3. 나를 친구 추가한 사람들 중에서 online인 유저 ID 리스트 가져오기
    const friend_list = await this.friendRepo.query(
      `select (friend.user_id) from friend JOIN users ON friend."user_id"=users."user_id" WHERE (friend_id='${user_id}' and status='online')`
    );

    console.log('online friend list: ', friend_list);

    // 4. 소켓 메세지 전송
    for (let idx in friend_list) {
      this.server.to(socketMap[friend_list[idx].user_id]).emit('offline', {user_id: user_id});
    }

    // 5. 소켓 저장소에서 제거
    delete socketMap[user_id];
    return ;
  }
}
