import { ConnectedSocket, MessageBody, OnGatewayDisconnect } from '@nestjs/websockets';
import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SessionService } from 'src/session/session.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from 'src/entities/users';
import { Friend } from 'src/entities/friend';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { Block } from 'src/entities/block';
import { DmStore } from 'src/entities/dm-store';
import { WsExceptionFilter } from 'src/filter/ws.filter';
import { GlobalSendDmDto, InviteChatDto, InviteGameDto } from 'src/dto/global';
import { err21 } from 'src/err';

// key: user id / value: socket id
export const socketMap = {};

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

@UseFilters(WsExceptionFilter)
@UsePipes(new ValidationPipe())
@WebSocketGateway({ namespace: 'global'})
export class GlobalGateway {
  constructor(
    @InjectRepository(Users) private usersRepo: Repository<Users>,
    @InjectRepository(Friend) private friendRepo: Repository<Friend>,
    @InjectRepository(Block) private blockRepo: Repository<Block>,
    @InjectRepository(DmStore) private dmRepo: Repository<DmStore>,
    private sessionService: SessionService
  ) {}

  @WebSocketServer() public server: Server;

  afterInit(server: Server): any {
    //console.log('Global WebSocket Server Init');
  }

  // 1. 로그인 한 경우 자기를 친구추가한 사람 중 온라인인 사람에게 online status 전송
  // 문제: 그 사람의 소켓을 어떻게 가져올것인가?
  // 해결: 소켓 연결시 소켓 맵에 저장
  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const cookie = socket.request.headers.cookie;
      let sid;
      if (cookie) {
        sid = cookie.split('.')[1].substring(8);
      } else {
        throw {err_msg: 'empty cookie'};
      }
      const userid = await this.sessionService.readUserId(sid);

      // 1. online 상태로 업데이트
      await this.usersRepo.update(userid, {status: 'online'});
      socketMap[userid] = socket.id;
      //console.log(`Global Socket Connected: ${userid}`);
      // 2. 친구 목록을 불러와서 online인 사람에게 online 메세지 전송 (status가 초록불로 바뀌도록)
      const friend_list = await this.friendRepo.find({friend_id: userid});
      let friend_id: string = '';
      for (let i in friend_list) {
        //console.log(i, friend_list[i]);
        friend_id = friend_list[i].user_id;
        this.server.to(socketMap[friend_id]).emit('online', {user_id: friend_id})
      }
    } catch (err) {
      //console.log(err);
    }  
  }

  async isBlockedUserFrom(target: string, from: string) {
    if (await this.blockRepo.count({user_id: from, block_id: target})) {
      //console.log(`${target} is blocked by ${from}`);
      return true;
    } else {
      return false;
    }
  }

  @SubscribeMessage('gameInvite')
  async inviteGame(@ConnectedSocket() socket: Socket, @MessageBody() body: InviteGameDto) {
    const user_id = findUIDwithSID(socket.id);

    // 1. 초대받은 사람 정보 가져오기 (타겟으로 닉네임이 주어져서 닉으로 검색해야함)
    const target_info = await this.usersRepo.findOne({nick: body.target});
    if (!target_info) {
      return err21;
    }

    const target_sid = socketMap[target_info.user_id];
    if (!target_sid) {
      // 오프라인 상태 인 경우 처리
      return ;
    }

    await this.dmRepo.save({
      sender_id: user_id,
      receiver_id: target_info.user_id,
      content: JSON.stringify({
        channelId: body.gameMap == '일반' ? 0 : (body.gameMap == '막대기' ? 1 : 2),
        gameMap: body.gameMap
      }),
      type: 'game'
    });
    
    const dm = await this.dmRepo.findOne({sender_id: user_id, receiver_id: target_info.user_id}, {order: {id: "DESC"}});
    this.server.to(target_sid).emit('gameInvite', {
      id: dm.id,
      time: dm.created_at,
      msg: dm.content,
      from: (await this.usersRepo.findOne({user_id: dm.sender_id})).nick,
      type: dm.type
    });
  }

  @SubscribeMessage('chatInvite')
  async inviteChat(@ConnectedSocket() socket: Socket, @MessageBody() body: InviteChatDto) {
    const user_id = findUIDwithSID(socket.id);
    // 1. 초대 받은사람 정보 가져오기
    const target_info = await this.usersRepo.findOne({nick: body.target});
    if (!target_info) {
      return err21;
    }

    // 2. 초대 받은사람 소켓 아이디 가져오기 (온라인 상태가 아니라면 global 소켓 id가 없음)
    const target_sid = socketMap[target_info.user_id]
    if (!target_sid) {
      // 오프라인 상태 인 경우 처리
      return ;
    }

    await this.dmRepo.save({
      sender_id: user_id, 
      receiver_id: target_info.user_id, 
      content: JSON.stringify({chatTitle: body.chatTitle, channelId: body.channelId}), 
      type: 'chat'
    });
    // 3. 초대 받을 사람에게 메세지 전달 (time을 가져오기 위해서 db에서 가져온다)
    const dm = await this.dmRepo.findOne({sender_id: user_id, receiver_id: target_info.user_id}, {order: {id: "DESC"}});
    this.server.to(target_sid).emit('chatInvite', {
      id: dm.id,
      time: dm.created_at,
      msg: dm.content,
      from: (await this.usersRepo.findOne({user_id: dm.sender_id})).nick,
      type: dm.type
    });
  }

  /*!
   * @brief 사용자가 DM을 보내는 경우
   *        1. DB에 저장.
   *        2. 상대방이 온라인 상태라면 소켓으로도 전송.
  */
  @SubscribeMessage('dm')
  async dmMessage(@ConnectedSocket() socket: Socket, @MessageBody() body: GlobalSendDmDto) {
    const user_id = findUIDwithSID(socket.id);
    const ref_user = await this.usersRepo.findOne({user_id: user_id});
    const target_nick = body.to;
    const target = await this.usersRepo.findOne({nick: target_nick});
    const target_id = target.user_id;

    // 1. 내가 dm을 보낸 대상에게 차단 당했는지 확인
    if (await this.isBlockedUserFrom(user_id, target_id)) {
      // 1-1. 차단당했으면 dm 요청시 아무 동작도 안함
    } else {
      // 2. dm 메세지 저장
      await this.dmRepo.save({sender_id: user_id, receiver_id: target_id, content: body.msg});
      // 3. 해당 유저가 소켓맵에 있다면 메세지 전송 (소켓맵에 있다는건 online 상태라는 의미)
      const target_sid = socketMap[target_id]
      if (target_sid) {
        this.server.to(target_sid).emit('dm', {
          from: ref_user.nick,
          msg: body.msg,
          time: Date.now(),
        })
      }
    }
  }

  // 2) 로그아웃시 나를 친추한 사람의 소켓에 오프라인 메세지 전송
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    // 1. 소켓맵에서 내 소켓 찾기
    const user_id = findUIDwithSID(socket.id);
    //console.log(`Global Socket Disconnected: ${user_id}`);

    // 2. DB에서 내 상태를 offline으로 변경
    await this.usersRepo.update({user_id: user_id}, {status: 'offline'});

    // 3. 나를 친구 추가한 사람들 중에서 online인 유저 ID 리스트 가져오기
    const friend_list = await this.friendRepo.query(
      `select (friend.user_id) from friend JOIN users ON friend."user_id"=users."user_id" WHERE (friend_id='${user_id}' and status='online')`
    );

    // 4. 소켓 메세지 전송
    for (let idx in friend_list) {
      this.server.to(socketMap[friend_list[idx].user_id]).emit('offline', {user_id: user_id});
    }

    // 5. 소켓 저장소에서 제거
    delete socketMap[user_id];
    return ;
  }
}
