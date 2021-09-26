import { Req } from '@nestjs/common';
import { ConnectedSocket, OnGatewayDisconnect } from '@nestjs/websockets';
import { WebSocketServer, OnGatewayConnection, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Request } from 'express';
import { Server, Socket } from 'socket.io';
import { SessionService } from 'src/session/session.service';
import { GameLogic } from './game.logic';

class WaitUser {
	constructor(
		public id: string,
		public socket: Socket,
	) {}
}


var normal_waiting: WaitUser[] = [];

/*!
 * @brief 게임 연결용 웹소켓
 * @notice 1. 프론트 서버에서 접근 허용을 위해 cors 옵션을 true로 해야함.
 * @			 2. 프론트에서 소켓 서버 연결시 withCredentials: true 옵션을 추가해줘야 connect.sid 쿠키가 전달되고,
 * @					그래야 백엔드에서 연결된 소켓의 유저가 누구인지 알 수 있다. (더 나은 방법이 있는지 확인해야 함)
 */
@WebSocketGateway({ namespace: 'game', cors: true })
export class GameGateway {
	constructor(
		private sessionService: SessionService, // readUserId 함수 쓰려고 가져옴
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
			const gameLogic = new GameLogic(700, 300, 1, this.server);
			const playerLeft = normal_waiting[0];
			const playerRight = normal_waiting[1];

			const roomName: string = playerLeft.id + playerRight.id;
			playerLeft.socket.join(roomName);
			playerRight.socket.join(roomName);
			playerLeft.socket.emit('matched', {roomId: roomName, opponent: normal_waiting[1].id, position: 'left'});
			playerRight.socket.emit('matched', {roomId: roomName, opponent: normal_waiting[0].id, position: 'right'});
			normal_waiting.splice(0, 2);

			playerLeft.socket.emit('init', gameLogic.getJson());
			playerRight.socket.emit('init', gameLogic.getJson());
			// this.server.to(roomName).emit("init", gameLogic.getJson());

			setInterval(() => {
				gameLogic.update();
			}, 20)
		}
		console.log('waiting:', normal_waiting);
  }



	@SubscribeMessage('ladder')
	async handdleMessage(@ConnectedSocket() socket: Socket) {
		
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