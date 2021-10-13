import { ConnectedSocket, MessageBody, OnGatewayDisconnect } from '@nestjs/websockets';
import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, forwardRef } from '@nestjs/common';
import { GlobalService } from 'src/global/global.service';
import { SessionService } from 'src/session/session.service';
import { ChatUsersService } from 'src/chat-users/chat-users.service';
import { UsersService } from 'src/users/users.service';

interface JoinMsg{
  room_id: string,
}

interface SocketInfo {
  room_id: string,
  user_id: string,
  nickname: string,
  avatar_url: string,
  position: string,
}

interface ChatLog {
  nick: string, // socket_map[socket.id].nickname
  position: string, // socket_map[socket.id].position
  avatar_url: string, // socket_map[socket.id].avatar_url
  time: number, // Date.now()
  message: string, // msg
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
    const session_id = this.globalService.getSessionIDFromCookie(socket.request.headers.cookie);
    const user_id = await this.sessionService.readUserId(session_id);
    const user_info = await this.usersService.getUserInfo(user_id);
    const room_id = body.room_id;
    const position = await this.chatUsersService.getUserPosition(user_id, room_id);

    this.socket_map[socket.id] = {
      room_id: room_id,
      user_id: user_id,
      nickname: user_info.nick,
      avatar_url: user_info.avatar_url,
      position: position,
    };

    socket.join(room_id);
    this.chatUsersService.createChatUsers(user_id, Number(room_id));
    console.log(`Join Message user: ${user_id}, channel: ${room_id}`);
    this.server.to(room_id).emit('message', {
      user: 'system',
      chat: `${user_id}님이 입장하셨습니다.`
    });
  }

  @SubscribeMessage('message')
  sendMessage(@ConnectedSocket() socket: Socket, @MessageBody() msg: string) {
    socket.to(this.socket_map[socket.id].room_id).emit('message', {
      nick: this.socket_map[socket.id].nickname,
      position: this.socket_map[socket.id].position,
      avatar_url: this.socket_map[socket.id].avatar_url,
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

  handleDisconnect(@ConnectedSocket() socket: Socket): any {
    const uid = this.socket_map[socket.id].user_id;
    const rid = this.socket_map[socket.id].room_id;

    console.log('Chat Socket Disconnected', uid);
    this.chatUsersService.deleteChatUsers(uid, Number(rid)); // 남은 유저가 없는 경우까지 이 메서드에서 처리
    socket.to(rid).emit('message', {
      user: 'system',
      chat: `${uid} 님이 퇴장하셨습니다.`,
    })
    socket.leave(rid);
    delete this.socket_map[socket.id];
  }
}