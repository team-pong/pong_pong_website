import { ConnectedSocket, OnGatewayDisconnect } from '@nestjs/websockets';
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

// key: user id / value: socket id
const socketMap = {};

// 3. dm 보내는 경우, dm 내용 db에 저장. 해당유저가 offline인 경우) db에 저장만 + 알람부분 col 추가?
//                                 online인 경우) 소켓으로 보냄
// 4. dm 받는 경우. online 상태에서) 소켓을 통해 받는다
//                oofline 상태에서) db를 통해 받는다? 아니면 소켓연결시 알람?
// 5. 게임중인 경우, 게임쪽에서 db 상태변경 + 소켓전송부분 추가해야함
@WebSocketGateway({ namespace: 'global'})
export class GlobalGateway {
  constructor(
    @InjectRepository(Users) private usersRepo: Repository<Users>,
    @InjectRepository(Friend) private friendRepo: Repository<Friend>,
    private sessionService: SessionService, // readUserId 함수 쓰려고 가져옴
    private friendService: FriendService,
    private globalService: GlobalService,
  ) {}

  @WebSocketServer() public server: Server;

  afterInit(server: any): any {
    console.log('Global WebSocket Server Init');
  }

  // 1. 로그인 한 경우 자기를 친구추가한 사람 중 온라인인 사람에게 online status 전송
  // 문제: 그 사람의 소켓을 어떻게 가져올것인가? (소켓 연결시 소켓 맵에 저장)
  async handleConnection(@ConnectedSocket() socket: Socket, ) {
    const sid: string = this.globalService.getSessionIDFromCookie(socket.request.headers.cookie);
    const userid = await this.sessionService.readUserId(sid);
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

  @SubscribeMessage('')
  handleMessage(@ConnectedSocket() socket: Socket): any {
  }

  // 2. 로그아웃시 나를 친추한 사람의 소켓에 오프라인 메세지 전송
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    let friend_id: string;

    // 소켓맵에서 내 소켓 찾기
    for (let i in socketMap) {
      if (socketMap[i] == socket.id) {
        // 내 친구에게 오프라인 메세지 전송
        const friend_list = await this.friendRepo.find({friend_id: i});
        for (let i in friend_list) {
          console.log(i, friend_list[i]);
          friend_id = friend_list[i].user_id;
          this.server.to(socketMap[friend_id]).emit('offline', {user_id: friend_id})
        }
        // 소켓맵에서 내 소켓 제거
        delete socketMap[i];
        // DB에서 상태 변경
        this.usersRepo.update(i, {status: 'offline'});
        return ;
      }
    }
    console.log('disconnected', socket.nsp.name);
  }
}
