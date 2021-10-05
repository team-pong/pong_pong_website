import { ConnectedSocket, MessageBody, OnGatewayDisconnect } from '@nestjs/websockets';
import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import axios from 'axios';
import { Inject, forwardRef } from '@nestjs/common';
import { GlobalService } from 'src/global/global.service';
import { SessionService } from 'src/session/session.service';

const socketMap = {};

interface JoinMsg{
  room_id: string,
}

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway {
  constructor(
    @Inject(forwardRef(() => GlobalService))
    private globalService: GlobalService,
    @Inject(forwardRef(() => SessionService))
    private sessionService: SessionService,
  ) {}

  @WebSocketServer() public server: Server;

  afterInit(server: any): any {
    console.log('Chat Server Init');
  }

  // 채널 접속시
  // 1. 해당 room에 join
  // 2. db 채팅방 유저 리스트에 추가요청
  // 3. 해당 유저 입장 시스템 메세지 전송
  @SubscribeMessage('join')
  joinMessage(@ConnectedSocket() socket: Socket, @MessageBody() body: JoinMsg) {
    const room_id = body.room_id;
    const user_id = socketMap[socket.id].uid;

    socketMap[socket.id].rid = room_id;
    socket.join(room_id);
    axios.post(`${process.env.BACKEND_SERVER_URL}/chat-users`, {user_id: user_id, channel_id: room_id});
    console.log(`Join Message user: ${user_id}, channel: ${room_id}`);
    this.server.to(room_id).emit('message', {
      user: 'system',
      chat: `${user_id}님이 입장하셨습니다.`
    });
  }

  @SubscribeMessage('message')
  sendMessage(@ConnectedSocket() socket: Socket, msg: string) {
    socket.to(socketMap[socket.id].rid).emit('message', {
      user: socketMap[socket.id].uid,
      chat: msg,
    })
    console.log(`Message Arrive user: ${socketMap[socket.id].uid}, chat: ${msg}`);
  }

  /*
  @todo 밴 당한 유저이면 입장 못하게 하는 기능 추가
  @todo userList에 각 유저가 owner인지 admin인지 normal인지를 정해주는 type 추가
  */
  async handleConnection(@ConnectedSocket() socket: Socket) {
    console.log('Chat 웹소켓 연결됨:', socket.nsp.name);

    const sid = this.globalService.getSessionIDFromCookie(socket.request.headers.cookie);
    const uid = await this.sessionService.readUserId(sid);

    socketMap[sid].uid = uid;
  }

  handleDisconnect(@ConnectedSocket() socket: Socket): any {
    const uid = socketMap[socket.id].uid;
    const rid = socketMap[socket.id].rid;

    console.log('Chat Socket Disconnected', uid);
    axios.delete(`${process.env.BACKEND_SERVER_URL}/chat-users?channel_id=${rid}&user_id=${uid}`)
    // if (남은 유저가 0명 이라면) {
    //   axios.delete(`${process.env.BACKEND_SERVER_URL}/chat?channel_id=${channel_id}`);
    // }
    socket.to(rid).emit('message', {
      user: 'system',
      chat: `${uid} 님이 퇴장하셨습니다.`,
    })
    socket.leave(rid);
    delete socketMap[socket.id];
  }
}