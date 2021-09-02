import { Req } from '@nestjs/common';
import { ConnectedSocket, OnGatewayDisconnect } from '@nestjs/websockets';
import { WebSocketServer, OnGatewayConnection, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Request } from 'express';
import { Server, Socket } from 'socket.io';
import { SessionService } from 'src/session/session.service';

/*
* https://127.0.0.1:3001/
*/
class WaitUser {
	constructor(
		public id: string,
		public socket: Socket,
	) {}
}

var normal_waiting: WaitUser[] = [];

@WebSocketGateway({ namespace: 'game', cors: true })
export class GameGateway {
	constructor(
		private sessionService: SessionService,
	) {}

	@WebSocketServer()public server: Server;

  @SubscribeMessage('normal')
  async handleMessage(@ConnectedSocket() socket: Socket) {
		// 쿠키에서 sid 파싱
		const sid: string = socket.request.headers.cookie.split('.')[1].substring(8);
		// sid로 유저 아이디 찾기
		const userid = await this.sessionService.readUserId(sid);
		// 큐에 넣기
		normal_waiting.push(new WaitUser(userid, socket));
		// 2인 이상시 매칭
		if (normal_waiting.length >= 2) {
			console.log('매칭 완료');
			const roomName: string = normal_waiting[0].id + normal_waiting[1].id;
			normal_waiting[0].socket.join(roomName);
			normal_waiting[1].socket.join(roomName);
			normal_waiting[0].socket.emit('matched', {roomId: roomName, opponent: normal_waiting[1].id});
			normal_waiting[1].socket.emit('matched', {roomId: roomName, opponent: normal_waiting[0].id});
			normal_waiting.splice(0, 2);
		}
		console.log('waiting:', normal_waiting);
  }

	afterInit(server: Server): any {
		console.log('Game Socket Server Init');
	}

	async handleConnection(@ConnectedSocket() socket: Socket) {
		console.log('Game 웹소켓 연결됨', socket.nsp.name);
		
		socket.on('disconnect', () => {
			for (let i = 0; i < normal_waiting.length; i++) {
				if (normal_waiting[i].socket.id === socket.id)  {
					normal_waiting.splice(i, 1);
					i--;
				}
			}
			console.log('Game 웹소켓 연결 해제', socket.id);
		})
	}
}


// import { ConnectedSocket, OnGatewayDisconnect } from '@nestjs/websockets';
// import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import axios from 'axios';

// export const onlineMap = {};

// @WebSocketGateway({ namespace: 'chat' })
// export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer() public server: Server;

//   @SubscribeMessage('message')
//   handleMessage(client: any, payload: any): string {
//     console.log('direct message');
//     return 'use POST /chat/:channel_id Body: {user: string, chat: string}';
//   }

//   afterInit(server: any): any {
//     console.log('WebSocket Server Init');
//   }

//   /*
//   @todo 밴 당한 유저이면 입장 못하게 하는 기능 추가
//   @todo userList에 각 유저가 owner인지 admin인지 normal인지를 정해주는 type 추가
//   */
//   async handleConnection(@ConnectedSocket() socket: Socket) {
//     console.log('Chat 웹소켓 연결됨:', socket.nsp.name);
//     const req = socket.request;
//     const { headers: {referer} } = req;
//     const channel_id = referer.split('/')[referer.split('/').length - 1];
//     const user_id = socket.data.userid;
//     axios.post(`http://127.0.0.1:3001/chat-users`, {user_id: user_id, channel_id: channel_id});
//     console.log(`user: ${user_id}, channel: ${channel_id}`);
//     socket.join(channel_id);
//     socket.to(channel_id).emit('message', {
//       user: 'system',
//       chat: `${user_id}님이 입장하셨습니다.`
//     });
    
//     const userList = await axios.get(`http://127.0.0.1:3001/chat-users?channel_id=${channel_id}`);
//     socket.to(channel_id).emit('userList', userList.data.chatUsersList);
    
//     socket.on('disconnect', () => {
//       console.log('Chat 웹소켓 연결 해제')
//       socket.leave(channel_id);
//       const userCount = 0;
//       if (userCount == 0) {
//         axios.delete(`http://127.0.0.1:3001/chat?channel_id=${channel_id}`);
//       } else {
//         axios.delete(`http://127.0.0.1:3001/chat-users?channel_id=${channel_id}&user_id=${user_id}`)
//         socket.to(channel_id).emit('message', {
//           user: 'system',
//           chat: `${user_id} 님이 퇴장하셨습니다.`,
//         })
//       }
//     })
//   }

//   handleDisconnect(@ConnectedSocket() socket: Socket): any {
//     console.log('disconnected', socket.nsp.name);
//   }
// }
