import { ConnectedSocket, MessageBody, OnGatewayDisconnect } from '@nestjs/websockets';
import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, forwardRef, UseGuards } from '@nestjs/common';
import { GlobalService } from 'src/global/global.service';
import { SessionService } from 'src/session/session.service';
import { ChatUsersService } from 'src/chat-users/chat-users.service';
import { UsersService } from 'src/users/users.service';
import { ChatService } from './chat.service';
import { LoggedInWsGuard } from 'src/auth/logged-in-ws.guard';
import { DeleteChatAdminDto, SetChatAdminDto, SetChatBanDto } from 'src/dto/chat';
import { AdminService } from 'src/admin/admin.service';
import { err0 } from 'src/err';
import { BanService } from 'src/ban/ban.service';

interface JoinMsg{
  room_id: string,
}

interface SocketInfo {
  room_id: string,
  user_id: string,
}

interface ChatLog {
  nick: string, // socket_map[socket.id].nickname
  position: string, // socket_map[socket.id].position
  avatar_url: string, // socket_map[socket.id].avatar_url
  time: number, // Date.now()
  message: string, // msg
};


interface ChatRoomInfo {
  title: string,
  type: string,
  current_people: number,
  max_people: number,
  passwd: string,
  users: ChatUserInfo[],
};

interface ChatUserInfo {
  nick: string,
  avatar_url: string,
  position: string,
};

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway {
  constructor(
    @Inject(forwardRef(() => GlobalService))
    private globalService: GlobalService,
    @Inject(forwardRef(() => SessionService))
    private sessionService: SessionService,
    @Inject(forwardRef(() => ChatUsersService))
    private chatUsersService: ChatUsersService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => ChatService))
    private chatService: ChatService,
    @Inject(forwardRef(() => AdminService))
    private adminService: AdminService,
    @Inject(forwardRef(() => BanService))
    private banService: BanService,
  ) {}

  @WebSocketServer() public server: Server;

  private socket_map: {[key: string]: SocketInfo} = {};

  afterInit(server: any): any {
    console.log('Chat Server Init');
  }

  // 채널 접속시
  // 1. 해당 room에 join
  // 2. db 채팅방 유저 리스트에 추가요청
  // 3. 해당 유저 입장 시스템 메세지 전송
  @SubscribeMessage('join')
  async joinMessage(@ConnectedSocket() socket: Socket, @MessageBody() body: JoinMsg) {
    // 새로운 유저가 채팅방에 참여한 경우
    try {
      const session_id = this.globalService.getSessionIDFromCookie(socket.request.headers.cookie);
      const user_id = await this.sessionService.readUserId(session_id);
      const user_info = await this.usersService.getUserInfo(user_id);
      const room_id = body.room_id;
      const position = await this.chatUsersService.getUserPosition(user_id, room_id);
  
      this.socket_map[socket.id] = {
        room_id: room_id,
        user_id: user_id,
      };
      
      // 1. 소켓 room 접속
      socket.join(room_id);
      // 2. chat-users에 유저 추가
      await this.chatUsersService.addUser(room_id, user_id);
      console.log(`Join Message user: ${user_id}, channel: ${room_id}`);
  
      // 3. 참여중인 모두에게 방 정보 전송 (참여 인원이 바뀌도록)
      const room_info = await this.chatService.getChannelInfo(Number(room_id));
      this.server.to(room_id).emit('setRoomInfo', room_info);
    
      // 4. 모두에게 유저 정보 리스트 전송 (목록에 새로운 유저가 추가되도록)
      const user_list = await this.chatUsersService.getUserListInRoom(room_id)
      this.server.to(room_id).emit('setRoomUsers', user_list);
  
      // 5. 시스템 메세지 전송
      this.server.to(room_id).emit('message', {
        user: 'system',
        chat: `${user_id}님이 입장하셨습니다.`
      });
    } catch (err) {
      console.log(err);
      return (err);
    }
  }

  @SubscribeMessage('setRoomInfo')
  async sendRoomInfo(@ConnectedSocket() socket: Socket, @MessageBody() room_info: any) {
    // owner가 방 제목 | 비밀번호 | 방 타입 | 기타 사항을 변경한 경우
    const room_id = this.socket_map[socket.id].room_id;

    // 1. chat db에 변경사항 업데이트
    // 2. 모두에게 방 정보 전송 (방 제목이나 타입 등이 바뀌도록)
    socket.to(room_id).emit('setRoomInfo', room_info);
    console.log(`Receive setRoomInfo Message: ${this.socket_map[socket.id].user_id}, roomInfo: ${room_info}`);
  }

  @SubscribeMessage('setAdmin')
  async setAdmin(@ConnectedSocket() socket: Socket, @MessageBody() setChatAdminDto: SetChatAdminDto) {
    // 어드민 권한 주기 요청이 들어온 경우
    // 1. 요청을 보낸 유저가 owner 인지 확인 (아니라면 에러)
    try {
      const room_id = this.socket_map[socket.id].room_id;
      const user_id = this.socket_map[socket.id].user_id;
      const position = await this.chatUsersService.getUserPosition(user_id, room_id);
      const target_nick = setChatAdminDto.nickname;
      if (position != 'owner') {
        throw ("당신은 채널 방장이 아닙니다.")
      }
      // 2. 바꾸려는 유저에 대한 정보 조회 (id 가져오려고)
      const target = await this.usersService.getUserInfoWithNick(target_nick);
      // 3. 어드민 권한 주기 (이미 어드민, 해당 유저없음 등 에러는 내부에서 return 됨)
      const ret = await this.adminService.createAdmin(target.user_id, Number(room_id));
      if (ret.err_msg != err0) {
        throw (ret);
      }
      // 4. 유저 리스트 다시 전송하기 (다른 유저들에게도 어드민 표시가 보이도록)
      const user_list = await this.chatUsersService.getUserListInRoom(room_id)
      this.server.to(room_id).emit('setRoomUsers', user_list);
    } catch (err) {
      console.log(`Chat Socket setAdmin error | ${err}`);
      return (err);
    }
  }

  @SubscribeMessage('deleteAdmin')
  async deleteAdmin(@ConnectedSocket() socket: Socket, @MessageBody() deleteChatAdminDto: DeleteChatAdminDto) {
    // 어드민 권한 제거 요청이 들어온 경우
    try {
      // 1. 요청 보낸 유저의 권한 확인 (owner 인가?)
      const room_id = this.socket_map[socket.id].room_id;
      const user_id = this.socket_map[socket.id].user_id;
      const position = await this.chatUsersService.getUserPosition(user_id, room_id);
      const target_nick = deleteChatAdminDto.nickname;
      if (position != 'owner') {
        throw ("당신은 채널 방장이 아닙니다.")
      }
      // 2. 바꾸려는 유저에 대한 정보 조회 (id 가져오기)
      const target = await this.usersService.getUserInfoWithNick(target_nick);
      // 3. 어드민 권한 제거 (setAdmin이랑 이 부분만 다름)
      const ret = await this.adminService.deleteAdmin(target.user_id, Number(room_id));
      if (ret.err_msg != err0) {
        throw (ret);
      }
      // 4. 유저 리스트 다시 전송하기 (다른 유저들에게도 어드민 표시가 보이도록)
      const user_list = await this.chatUsersService.getUserListInRoom(room_id)
      this.server.to(room_id).emit('setRoomUsers', user_list);
    } catch (err) {
      console.log(`Chat Socket deleteAdmin error | ${err}`);
      return (err);
    }
  }

  @SubscribeMessage('setBan')
  async setBan(@ConnectedSocket() socket: Socket, @MessageBody() setChatBanDto: SetChatBanDto) {
    // 특정 유저 밴하기 요청시
    try {
      // 1. 요청 보낸 유저의 권한 확인 (admin 또는 owner 인가?)
      const room_id = this.socket_map[socket.id].room_id;
      const user_id = this.socket_map[socket.id].user_id;
      const position = await this.chatUsersService.getUserPosition(user_id, room_id);
      const target_nick = setChatBanDto.nickname;
      if (position != 'owner' && position != 'admin') {
        throw ("당신은 밴 권한이 없습니다.")
      }
      // 2. 밴 하려는 유저 정보 조회 (id 가져오기)
      const target = await this.usersService.getUserInfoWithNick(target_nick);
      // 3. ban db에 추가
      const ret = await this.banService.createBan(target.user_id, Number(room_id));
      if (ret.err_msg != err0) {
        throw (ret);
      }
      // 4. 유저 리스트 다시 전송하기 (다른 유저들에게도 어드민 표시가 보이도록)
      const user_list = await this.chatUsersService.getUserListInRoom(room_id)
      this.server.to(room_id).emit('setRoomUsers', user_list);
    } catch (err) {
      console.log(`Chat Socket setBan error | ${err}`);
      return (err);
    } 
  }

  @SubscribeMessage('message')
  async sendMessage(@ConnectedSocket() socket: Socket, @MessageBody() msg: string) {
    const room_id = this.socket_map[socket.id].room_id;
    const user_id = this.socket_map[socket.id].user_id;
    const user_info = await this.usersService.getUserInfo(user_id);
    
    socket.to(this.socket_map[socket.id].room_id).emit('message', {
      nick: user_info.nick,
      position: await this.chatUsersService.getUserPosition(user_id, room_id),
      avatar_url: user_info.avatar_url,
      time: Date.now(),
      message: msg,
    })
    console.log(`Message Arrive user: ${this.socket_map[socket.id].user_id}, chat: ${msg}`);
  }

  /*
  @todo 밴 당한 유저이면 입장 못하게 하는 기능 추가
  @todo userList에 각 유저가 owner인지 admin인지 normal인지를 정해주는 type 추가
  */
  async handleConnection(@ConnectedSocket() socket: Socket) {
    const session_id = this.globalService.getSessionIDFromCookie(socket.request.headers.cookie);
    const user_id = await this.sessionService.readUserId(session_id);

    console.log('Chat 웹소켓 연결됨:', user_id);
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    try {
      const uid = this.socket_map[socket.id].user_id;
      const rid = this.socket_map[socket.id].room_id;

      console.log('Chat Socket Disconnected', uid);
      await this.chatUsersService.deleteUser(rid, uid); // 남은 유저가 없는 경우까지 이 메서드에서 처리

      // 방 정보 전송
      const room_info = await this.chatService.getChannelInfo(Number(rid));
      this.server.to(rid).emit('setRoomInfo', room_info);
    
      // 유저 정보 리스트 전송 닉 ,아바타, 포지션
      const user_list = await this.chatUsersService.getUserListInRoom(rid)
      this.server.to(rid).emit('setRoomUsers', user_list);

      socket.to(rid).emit('message', {
        user: 'system',
        chat: `${uid} 님이 퇴장하셨습니다.`,
      })
      socket.leave(rid);
      delete this.socket_map[socket.id];
    } catch (err) {
      console.error(err);
    }
  }
}