import { ConnectedSocket, OnGatewayDisconnect } from '@nestjs/websockets';
import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import axios from 'axios';
import { SessionService } from 'src/session/session.service';
import { FriendService } from 'src/friend/friend.service';
import { UsersDto3 } from 'src/dto/users';

export const onlineMap = {};

@WebSocketGateway({ namespace: 'global', cors: true })
export class GlobalGateway {
  
  constructor(
    private sessionService: SessionService, // readUserId 함수 쓰려고 가져옴
    private friendService: FriendService,
  ) {}

  @WebSocketServer() public server: Server;

  afterInit(server: any): any {
    console.log('Global WebSocket Server Init');
  }

  /*
  @todo 밴 당한 유저이면 입장 못하게 하는 기능 추가
  @todo userList에 각 유저가 owner인지 admin인지 normal인지를 정해주는 type 추가
  */
  // async handleConnection(@ConnectedSocket() socket: Socket) {
  //   console.log('Global 웹소켓 연결됨:', socket.nsp.name);
  //   const sid: string = socket.request.headers.cookie.split('.')[1].substring(8);
	// 	const user_id = await this.sessionService.readUserId(sid);
  //   const friends = await this.friendService.readFriend(user_id, 'send');

  //   friend
  //   for (friend of (friends as UsersDto3[]).friendList )
  //   socket.join(channel_id);
  //   socket.to(channel_id).emit('message', {
  //     user: 'system',
  //     chat: `${user_id}님이 입장하셨습니다.`
  //   });
    
  //   const userList = await axios.get(`http://127.0.0.1:3001/chat-users?channel_id=${channel_id}`);
  //   socket.to(channel_id).emit('userList', userList.data.chatUsersList);
    
  //   socket.on('disconnect', () => {
  //     console.log('Chat 웹소켓 연결 해제')
  //     socket.leave(channel_id);
  //     const userCount = 0;
  //     if (userCount == 0) {
  //       axios.delete(`http://127.0.0.1:3001/chat?channel_id=${channel_id}`);
  //     } else {
  //       axios.delete(`http://127.0.0.1:3001/chat-users?channel_id=${channel_id}&user_id=${user_id}`)
  //       socket.to(channel_id).emit('message', {
  //         user: 'system',
  //         chat: `${user_id} 님이 퇴장하셨습니다.`,
  //       })
  //     }
  //   })
  // }

  handleDisconnect(@ConnectedSocket() socket: Socket): any {
    console.log('disconnected', socket.nsp.name);
  }
}
