import { ConnectedSocket, MessageBody, OnGatewayDisconnect } from '@nestjs/websockets';
import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, forwardRef, UseGuards, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { GlobalService } from 'src/global/global.service';
import { SessionService } from 'src/session/session.service';
import { ChatUsersService } from 'src/chat-users/chat-users.service';
import { UsersService } from 'src/users/users.service';
import { ChatService } from './chat.service';
import { LoggedInWsGuard } from 'src/auth/logged-in-ws.guard';
import { DeleteChatAdminDto, DeleteChatMuteDto, JoinChatDto, SendChatMessageDto, SetChatAdminDto, SetChatBanDto, SetChatMuteDto, SetChatRoomInfoDto } from 'src/dto/chat';
import { AdminService } from 'src/admin/admin.service';
import { err0 } from 'src/err';
import { BanService } from 'src/ban/ban.service';
import { MuteService } from 'src/mute/mute.service';
import { WsExceptionFilter } from 'src/filter/ws.filter';

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

@UseFilters(WsExceptionFilter)
@UsePipes(new ValidationPipe())
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
    @Inject(forwardRef(() => MuteService))
    private muteService: MuteService
  ) {}

  @WebSocketServer() public server: Server;

  private socket_map: {[key: string]: SocketInfo} = {};

  afterInit(server: any): any {
    console.log('Chat Server Init');
  }

  async isChannelFull(room_id: string) {
    const user_nums = await this.chatUsersService.getUserNumber(room_id);
    const max_people = await this.chatService.getMaxNumber(room_id);
    if (user_nums >= max_people) {
      return true;
    }
    return false;
  }

  // 채널 접속시
  // 1. 해당 room에 join
  // 2. db 채팅방 유저 리스트에 추가요청
  // 3. 해당 유저 입장 시스템 메세지 전송
  @SubscribeMessage('join')
  async joinMessage(@ConnectedSocket() socket: Socket, @MessageBody() body: JoinChatDto) {
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
      // 1. 소켓 room 접속 (풀방인지 체크)
      if (await this.isChannelFull(room_id)) throw "채널이 꽉 찼습니다.";
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
  async sendRoomInfo(@ConnectedSocket() socket: Socket, @MessageBody() room_info: SetChatRoomInfoDto) {
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
      // 2. 바꾸려는 유저에 대한 정보 조회 (id 가져오려고, 권한 확인)
      const target = await this.usersService.getUserInfoWithNick(target_nick);
      const target_pos = await this.chatUsersService.getUserPosition(target.user_id, room_id);
      if (!this.hasPermissionOf(position, target_pos)) {
        throw (`${position}는 ${target_pos} 에게 해당 명령 권한이 없습니다.`);
      }
      // 3. 어드민 권한 주기 (이미 어드민, 해당 유저없음 등 에러는 내부에서 return 됨)
      const ret = await this.adminService.createAdmin(target.user_id, Number(room_id));
      if (ret.err_msg != err0) {
        throw (ret.err_msg);
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
      // 2. 바꾸려는 유저에 대한 정보 조회 (id 가져오기, 권한 확인)
      const target = await this.usersService.getUserInfoWithNick(target_nick);
      const target_pos = await this.chatUsersService.getUserPosition(target.user_id, room_id);
      if (!this.hasPermissionOf(position, target_pos)) {
        throw (`${position}는 ${target_pos} 에게 해당 명령 권한이 없습니다.`);
      }
      // 3. 어드민 권한 제거 (setAdmin이랑 이 부분만 다름)
      const ret = await this.adminService.deleteAdmin(target.user_id, Number(room_id));
      if (ret.err_msg != err0) {
        throw (ret.err_msg);
      }
      // 4. 유저 리스트 다시 전송하기 (다른 유저들에게도 어드민 표시가 보이도록)
      const user_list = await this.chatUsersService.getUserListInRoom(room_id)
      this.server.to(room_id).emit('setRoomUsers', user_list);
    } catch (err) {
      console.log(`Chat Socket deleteAdmin error | ${err}`);
      return (err);
    }
  }

  hasPermissionOf(order: string, target: string) {
    if ((order == 'admin' || order == 'owner') && target == 'normal') {
      return true;
    } else if (order == 'owner' && target == 'admin') {
      return true;
    }
    return false;
  } 

  @SubscribeMessage('setBan')
  async setBan(@ConnectedSocket() socket: Socket, @MessageBody() setChatBanDto: SetChatBanDto) {
    // 특정 유저 밴하기 요청시
    try {
      const room_id = this.socket_map[socket.id].room_id;
      const user_id = this.socket_map[socket.id].user_id;
      const position = await this.chatUsersService.getUserPosition(user_id, room_id);
      const target_nick = setChatBanDto.nickname;
      // 1. 요청 보낸 유저의 권한 확인 (admin 또는 owner 인가?)
      if (position != 'owner' && position != 'admin') {
        throw ("당신은 밴 권한이 없습니다.")
      }
      // 2. 밴 하려는 유저 정보 권한 확인 ()
      const target = await this.usersService.getUserInfoWithNick(target_nick);
      const target_pos = await this.chatUsersService.getUserPosition(target.user_id, room_id);
      if (!this.hasPermissionOf(position, target_pos)) {
        throw (`${position}는 ${target_pos} 에게 해당 명령 권한이 없습니다.`);
      }
      // 3. ban db에 추가
      const ret = await this.banService.createBan(target.user_id, Number(room_id));
      if (ret.err_msg != err0) {
        throw (ret.err_msg);
      }
      // 4. 유저 리스트 다시 전송하기는 (밴당한 유저의 position을 ban으로 바꾸면, 프론트에서 소켓 연결이 끊어지고 나가지게 된다.)
      const user_list = await this.chatUsersService.getUserListInRoom(room_id)
      this.server.to(room_id).emit('setRoomUsers', user_list);
    } catch (err) {
      console.log(`Chat Socket setBan error | ${err}`);
      return (err);
    }
  }

  @SubscribeMessage('setMute')
  async mute(@ConnectedSocket() socket: Socket, @MessageBody() setChatMuteDto: SetChatMuteDto) {
    // 특정 유저 뮤트하기
    try {
      // 1. 요청 보낸 유저의 권한 확인 (admin 또는 owner 인가?)
      const room_id = this.socket_map[socket.id].room_id;
      const user_id = this.socket_map[socket.id].user_id;
      const position = await this.chatUsersService.getUserPosition(user_id, room_id);
      const target_nick = setChatMuteDto.nickname;
      if (position != 'owner' && position != 'admin') {
        throw ("당신은 밴 권한이 없습니다.")
      }
      // 2. 뮤트 하려는 유저 정보 조회 (id 가져오기, 권한 확인)
      const target = await this.usersService.getUserInfoWithNick(target_nick);
      const target_pos = await this.chatUsersService.getUserPosition(target.user_id, room_id);
      if (!this.hasPermissionOf(position, target_pos)) {
        throw (`${position}는 ${target_pos} 에게 해당 명령 권한이 없습니다.`);
      }
      // 3. mute db에 추가
      const ret = await this.muteService.createMute(target.user_id, Number(room_id));
      if (ret.err_msg != err0) {
        throw (ret.err_msg);
      }
      // 4. 유저 리스트 다시 전송하기 (mute 상태 아이콘이 뜨도록 한다.)
      const user_list = await this.chatUsersService.getUserListInRoom(room_id)
      this.server.to(room_id).emit('setRoomUsers', user_list);
    } catch (err) {
      console.log(`Chat Socket setMute error | ${err}`);
      return (err);
    }
  }

  @SubscribeMessage('unMute')
  async unMute(@ConnectedSocket() socket: Socket, @MessageBody() deleteChatMuteDto: DeleteChatMuteDto) {
    // 특정 유저 뮤트하기
    try {
      // 1. 요청 보낸 유저의 권한 확인 (admin 또는 owner 인가?)
      const room_id = this.socket_map[socket.id].room_id;
      const user_id = this.socket_map[socket.id].user_id;
      const position = await this.chatUsersService.getUserPosition(user_id, room_id);
      const target_nick = deleteChatMuteDto.nickname;
      if (position != 'owner' && position != 'admin') {
        throw ("당신은 밴 권한이 없습니다.")
      }
      // 2. 뮤트 하려는 유저 정보 조회 (id 가져오기, 권한 확인)
      const target = await this.usersService.getUserInfoWithNick(target_nick);
      const target_pos = await this.chatUsersService.getUserPosition(target.user_id, room_id);
      if (!this.hasPermissionOf(position, target_pos)) {
        throw (`${position}는 ${target_pos} 에게 해당 명령 권한이 없습니다.`);
      }
      // 3. mute db에서 타겟 id 삭제
      await this.muteService.unMute(target.user_id, Number(room_id));
      // 4. 유저 리스트 다시 전송하기 (mute 상태 아이콘이 제거되도록, position 갱신)
      const user_list = await this.chatUsersService.getUserListInRoom(room_id)
      this.server.to(room_id).emit('setRoomUsers', user_list);
    } catch (err) {
      console.log(`Chat Socket unMute error | ${err}`);
      return (err);
    }
  }

  @SubscribeMessage('message')
  async sendMessage(@ConnectedSocket() socket: Socket, @MessageBody() body: SendChatMessageDto) {
    const room_id = this.socket_map[socket.id].room_id;
    const user_id = this.socket_map[socket.id].user_id;
    const user_info = await this.usersService.getUserInfo(user_id);
    
    socket.to(this.socket_map[socket.id].room_id).emit('message', {
      nick: user_info.nick,
      position: await this.chatUsersService.getUserPosition(user_id, room_id),
      avatar_url: user_info.avatar_url,
      time: Date.now(),
      message: body.msg,
    })
    console.log(`Message Arrive user: ${this.socket_map[socket.id].user_id}, chat: ${body.msg}`);
  }

  /*
  @todo 밴 당한 유저이면 입장 못하게 하는 기능 추가
  @todo userList에 각 유저가 owner인지 admin인지 normal인지를 정해주는 type 추가
  */
  async handleConnection(@ConnectedSocket() socket: Socket) {
    const session_id = this.globalService.getSessionIDFromCookie(socket.request.headers.cookie);
    const user_id = await this.sessionService.readUserId(session_id);

    console.log('Chat Socket Connected:', user_id);
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    try {
      const uid = this.socket_map[socket.id].user_id;
      const rid = this.socket_map[socket.id].room_id;

      console.log('Chat Socket Disconnected:', uid);
      // 1-1. chat-users db에서 제거
      await this.chatUsersService.deleteUser(rid, uid); // 남은 유저가 없는 경우까지 이 메서드에서 처리

      // 2. 변경된 방 정보 전송 (방 인원수 줄음)
      const room_info = await this.chatService.getChannelInfo(Number(rid));
      this.server.to(rid).emit('setRoomInfo', room_info);
    
      // 3. 유저 정보 리스트 전송 (빠진 인원 갱신)
      const user_list = await this.chatUsersService.getUserListInRoom(rid)
      this.server.to(rid).emit('setRoomUsers', user_list);

      // 4. 시스템 메세지 전송
      socket.to(rid).emit('message', {
        user: 'system',
        chat: `${uid} 님이 퇴장하셨습니다.`,
      })

      // 5. 해당소켓 leave
      socket.leave(rid);

      // 6. 해당 소켓 정보 제거
      delete this.socket_map[socket.id];
    } catch (err) {
      console.error(err);
    }
  }
}