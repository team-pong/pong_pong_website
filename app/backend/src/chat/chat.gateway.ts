import { ConnectedSocket, OnGatewayDisconnect } from '@nestjs/websockets';
import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import axios from 'axios';

export const onlineMap = {};

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() public server: Server;


  afterInit(server: any): any {
    console.log('WebSocket Server Init');
  }

  /*!
   * @brief 
   * @todo 밴 당한 유저이면 입장 못하게 하는 기능 추가
   * @todo userList에 각 유저가 owner인지 admin인지 normal인지를 정해주는 type 추가
   */
  async handleConnection(@ConnectedSocket() socket: Socket) {
    console.log('Chat 웹소켓 연결됨:', socket.nsp.name);
    const req = socket.request;
    const { headers: {referer} } = req;
    const channel_id = referer.split('/')[referer.split('/').length - 1];
    const user_id = socket.data.userid;
    // 1. 채팅 유저 db에 추가
    axios.post(`http://127.0.0.1:3001/chat-users`, {user_id: user_id, channel_id: channel_id});
    console.log(`user: ${user_id}, channel: ${channel_id}`);
    // 2. 채팅방 소켓에 접속 후 입장 메세지 전송
    socket.join(channel_id);
    socket.to(channel_id).emit('message', {
      user: 'system',
      chat: `${user_id}님이 입장하셨습니다.`
    });
    
    // 3. 채팅방에 참가중인 유저리스트 조회 후 클라이언트로 보내주기
    const userList = await axios.get(`http://127.0.0.1:3001/chat-users?channel_id=${channel_id}`);
    socket.to(channel_id).emit('userList', userList.data.chatUsersList);
    

    // 4. 연결해제시 채팅방 유저목록 db에서제거, 유저가 없으면 채팅방 제거
    socket.on('disconnect', () => {
      console.log('Chat 웹소켓 연결 해제')
      socket.leave(channel_id);
      const userCount = 0;
      if (userCount == 0) {
        axios.delete(`http://127.0.0.1:3001/chat?channel_id=${channel_id}`);
      } else {
        axios.delete(`http://127.0.0.1:3001/chat-users?channel_id=${channel_id}&user_id=${user_id}`)
        socket.to(channel_id).emit('message', {
          user: 'system',
          chat: `${user_id} 님이 퇴장하셨습니다.`,
        })
      }
    })
  }

  handleDisconnect(@ConnectedSocket() socket: Socket): any {
    console.log('disconnected', socket.nsp.name);
  }
}
