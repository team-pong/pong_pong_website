import { Req } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConnectedSocket, OnGatewayDisconnect } from '@nestjs/websockets';
import { WebSocketServer, OnGatewayConnection, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Request } from 'express';
import { Server, Socket } from 'socket.io';
import { SessionService } from 'src/session/session.service';
import { UsersService } from 'src/users/users.service';
import { Scored, GameLogic } from './game.logic';

class WaitUser {
	constructor(
		public id: string,
		public socket: Socket,
	) {}
}

interface MatchInfo {
  lPlayerNickname: string,
  lPlayerAvatarUrl: string,
  lPlayerScore: number,
  rPlayerNickname: string,
  rPlayerAvatarUrl: string,
  rPlayerScore: number,
  viewNumber: number,
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
		private usersService: UsersService,
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
			
			const gameLogic = new GameLogic(700, 450, 1, this.server);
			const playerLeft = normal_waiting[0];
			const playerRight = normal_waiting[1];

			const roomName: string = playerLeft.id + playerRight.id;
			playerLeft.socket.join(roomName);
			playerRight.socket.join(roomName);
			playerLeft.socket.emit('matched', {roomId: roomName, opponent: normal_waiting[1].id, position: 'left'});
			playerRight.socket.emit('matched', {roomId: roomName, opponent: normal_waiting[0].id, position: 'right'});
			normal_waiting.splice(0, 2);

			const ret = gameLogic.getJson();
			const userInfo: MatchInfo = {
				lPlayerNickname: playerLeft.id,
				lPlayerAvatarUrl: await this.usersService.getAvatarUrl(playerLeft.id),
				lPlayerScore: 0,
				rPlayerNickname: playerRight.id,
				rPlayerAvatarUrl: await this.usersService.getAvatarUrl(playerRight.id),
				rPlayerScore: 0,
				viewNumber: socket.client.conn.server.clientsCount - 2,
			}

			playerLeft.socket.emit('init', gameLogic.getJson(), userInfo);
			playerRight.socket.emit('init', gameLogic.getJson(), userInfo);
			// this.server.to(roomName).emit("init", gameLogic.getJson());

			playerLeft.socket.emit('setMatchInfo', userInfo);
			playerRight.socket.emit('setMatchInfo', userInfo);
			// arrowDown : true -> 아래 방향키가 눌린 상태
			// arrowDown : false -> 아래 방향키를 뗀 상태
			// arrowUp : true -> 위 방향키가 눌린 상태
			// arrowUp : false -> 위 방향키를 뗀 상태
			playerLeft.socket.on('keyEvent', (e) => {
				console.log('left player key event:', e);
				if (e.arrowDown === true) { // 아랫키 눌림
					gameLogic.moveBar(false, true);
				} else if (e.arrowDown === false) {
					clearInterval(gameLogic._leftBarMovement);
					if (e.arrowUp === 1) {
						gameLogic.moveBar(true, true);
					}
				}
				if (e.arrowUp === true) {
					gameLogic.moveBar(true, true);
				} else if (e.arrowUp === false) {
					clearInterval(gameLogic._leftBarMovement);
					if (e.arrowDown === 1) {
						gameLogic.moveBar(false, true);
					}
				}
			})

			playerRight.socket.on('keyEvent', (e) => {
				console.log('right player key event:', e);
				if (e.arrowDown === true) { // 아랫키 눌림
					gameLogic.moveBar(false, false);
				} else if (e.arrowDown === false) {
					clearInterval(gameLogic._rightBarMovement);
					if (e.arrowUp === 1) {
						gameLogic.moveBar(true, false);
					}
				}
				if (e.arrowUp ===  true) {
					gameLogic.moveBar(true, false);
				} else if (e.arrowUp === false) {
					clearInterval(gameLogic._rightBarMovement);
					if (e.arrowDown === 1) {
						gameLogic.moveBar(false, false);
					}
				}
			});

			const updateInterval = setInterval(() => {
				if (userInfo.lPlayerScore == 3
					|| userInfo.rPlayerScore == 3
					|| (userInfo.lPlayerScore + userInfo.rPlayerScore) >= 5) {
						clearInterval(updateInterval);
						clearInterval(gameLogic._leftBarMovement);
						clearInterval(gameLogic._rightBarMovement);
						playerRight.socket.removeAllListeners()
						playerLeft.socket.removeAllListeners()
						// 게임 끝남, 전적 DB에 저장, 모달창 닫도록 프론트에 전달, 소켓 연결 끊고 리소스 정리
						// 
					}
				if (gameLogic._score == Scored.PLAYER00) {
					console.log("left win");
					userInfo.lPlayerScore++;
					gameLogic.initGame();
					playerLeft.socket.emit('setMatchInfo', userInfo);
					playerRight.socket.emit('setMatchInfo', userInfo);
				} else if (gameLogic._score == Scored.PLAYER01) {
					console.log("right win");
					userInfo.rPlayerScore++;
					gameLogic.initGame();
					playerLeft.socket.emit('setMatchInfo', userInfo);
					playerRight.socket.emit('setMatchInfo', userInfo);
				} else {
					// frontㅇㅔ서 준비 완료되면 시작(3, 2, 1, Start 메시지)
					gameLogic.update();
					playerLeft.socket.emit("update", gameLogic.getJson());
					playerRight.socket.emit("update", gameLogic.getJson());	
				}
			}, 20);
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