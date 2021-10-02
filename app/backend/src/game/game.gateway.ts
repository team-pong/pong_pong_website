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

interface socketInfo {
	socket: Socket,
	sid: string, // session id
	uid: string, // user id
	rid: string, // room id
}

var normal_waiting: WaitUser[] = [];

var socket_infos = {};

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

		socket_infos[socket.id] = {socket: socket, sid: sid, uid: userid, rid: null};
		// 큐에 넣기
		normal_waiting.push(new WaitUser(userid, socket));
		// 2인 이상시 매칭
		if (normal_waiting.length >= 2) {
			console.log('매칭 완료');
			
			const gameLogic = new GameLogic(700, 450, 1, this.server);
			const playerLeft = normal_waiting[0];
			const playerRight = normal_waiting[1];

			const roomName: string = playerLeft.id + playerRight.id;
			socket_infos[playerLeft.socket.id].rid = roomName;
			socket_infos[playerRight.socket.id].rid = roomName;
			playerLeft.socket.join(roomName);
			playerRight.socket.join(roomName);
			playerLeft.socket.emit('matched', {roomId: roomName, opponent: normal_waiting[1].id, position: 'left'});
			playerRight.socket.emit('matched', {roomId: roomName, opponent: normal_waiting[0].id, position: 'right'});
			normal_waiting.splice(0, 2);
			console.log(socket.client.conn.server)

			const ret = gameLogic.getJson();
			const userInfo: MatchInfo = {
				lPlayerNickname: playerLeft.id,
				lPlayerAvatarUrl: await this.usersService.getAvatarUrl(playerLeft.id),
				lPlayerScore: 0,
				rPlayerNickname: playerRight.id,
				rPlayerAvatarUrl: await this.usersService.getAvatarUrl(playerRight.id),
				rPlayerScore: 0,
				viewNumber: 0,
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
			})

			// 점수처리 추가, 득점시 초기화, 게임 종료메세지
			const interval = setInterval(() => {
				gameLogic.update();
				playerLeft.socket.emit("update", gameLogic.getJson());
				playerRight.socket.emit("update", gameLogic.getJson());
				if (gameLogic._score == Scored.PLAYER00) {
					userInfo.lPlayerScore++;
					// clearInterval(interval);
					playerLeft.socket.emit('setMatchInfo', userInfo);
					playerRight.socket.emit('setMatchInfo', userInfo);
				} else if (gameLogic._score == Scored.PLAYER01) {
					userInfo.rPlayerScore++;
					// clearInterval(interval);
					playerLeft.socket.emit('setMatchInfo', userInfo);
					playerRight.socket.emit('setMatchInfo', userInfo);
				}
			}, 20)
			// gamsScore ㅇㅣㄹ정 값 되면 update interval 제거
			// 
			socket.on("disconnect", () => {
				console.log('이벤트 리스너 제거 작업');
				console.log('인터벌 제거 작업');
			})
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
	}

	handleDisconnect(@ConnectedSocket() socket: Socket) {
		console.log('Game 웹소켓 연결 해제', socket_infos[socket.id].uid);
		for (let i = 0; i < normal_waiting.length; i++) {
			if (normal_waiting[i].socket.id === socket.id)  {
				console.log('delete waiting queue', socket_infos[socket.id].uid);
				normal_waiting.splice(i, 1);
				i--;
				delete socket_infos[socket.id];

				return ;
			}
		}
		/*
		 * 게임 도중 탈주 한 경우 처리 
		*/
		if (socket_infos[socket.id].rid) {
			console.log('broadcast disconnected message');
			socket.broadcast.emit("disconnected", {id: socket_infos[socket.id]?.uid});
			delete socket_infos[socket.id];
		}
	}
}