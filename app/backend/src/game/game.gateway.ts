import { Req } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConnectedSocket, OnGatewayDisconnect } from '@nestjs/websockets';
import { WebSocketServer, OnGatewayConnection, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Request } from 'express';
import { Server, Socket } from 'socket.io';
import { MatchService } from 'src/match/match.service';
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
	myName: string,
}

interface socketInfo {
	socket: Socket,
	sid: string, // session id
	uid: string, // user id
	rid: string, // room id
	match: MatchInfo,
}

interface Game {
	timeout: NodeJS.Timeout,
}

var normal_waiting: WaitUser[] = [];
var socket_infos: {[key: string]: socketInfo} = {};
var games: {[key: string]: Game} = {};

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
		private matchService: MatchService,
	) {}

	@WebSocketServer()public server: Server;

  @SubscribeMessage('normal')
  async handleMessage(@ConnectedSocket() socket: Socket) {
		// 쿠키에서 sid 파싱
		const sid: string = socket.request.headers.cookie.split('.')[1].substring(8);
		// sid로 유저 아이디 찾기
		const userid = await this.sessionService.readUserId(sid);

		socket_infos[socket.id] = {socket: socket, sid: sid, uid: userid, rid: null, match: null};
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
				myName: '',
			}
			socket_infos[playerLeft.socket.id].match = userInfo;
			socket_infos[playerRight.socket.id].match = userInfo;

			playerLeft.socket.emit('init', gameLogic.getJson(), userInfo);
			playerRight.socket.emit('init', gameLogic.getJson(), userInfo);
			// this.server.to(roomName).emit("init", gameLogic.getJson());

			playerLeft.socket.emit('setMatchInfo', {...userInfo, myName: userInfo.lPlayerNickname} );
			playerRight.socket.emit('setMatchInfo', {...userInfo, myName: userInfo.rPlayerNickname} );
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

			/*
			 * @brief 기권 버튼 클릭시 결과 전송 후 게임 종료
			*/
			playerLeft.socket.on("giveUp", () => {
				this.matchService.createMatch(playerRight.id, playerLeft.id, gameLogic._score[1], gameLogic._score[0], 'normal', 0);
				playerLeft.socket.emit('matchEnd', 'LOSE');
				playerRight.socket.emit('matchEnd', 'WIN');
				clearInterval(updateInterval);
				clearTimeout(games[socket_infos[socket.id].rid].timeout);
				clearInterval(gameLogic._leftBarMovement);
				clearInterval(gameLogic._rightBarMovement);
				playerRight.socket.removeAllListeners();
				playerLeft.socket.removeAllListeners();
			})

			playerRight.socket.on("giveUp", () => {
				this.matchService.createMatch(playerLeft.id, playerRight.id, gameLogic._score[0], gameLogic._score[1], 'normal', 0);
				playerLeft.socket.emit('matchEnd', 'WIN');
				playerRight.socket.emit('matchEnd', 'LOSE');
				clearInterval(updateInterval);
				clearTimeout(games[socket_infos[socket.id].rid].timeout);
				clearInterval(gameLogic._leftBarMovement);
				clearInterval(gameLogic._rightBarMovement);
				playerRight.socket.removeAllListeners();
				playerLeft.socket.removeAllListeners();
			})
			let updateInterval : NodeJS.Timeout;
			console.log("timeout start");
			games[socket_infos[socket.id].rid] = {timeout: null};
			this.server.to(roomName).emit("startCount");
			games[socket_infos[socket.id].rid].timeout = setTimeout(() => {
				updateInterval = setInterval(() => {
					this.gameInterval(userInfo, playerLeft, playerRight, updateInterval, gameLogic, socket);
				}, 20)
				console.log("timeout end");
			}, 3000)
			// let updateInterval = setInterval(() => {
			// 	this.gameInterval(userInfo, playerLeft, playerRight, updateInterval, gameLogic);
			// }, 20)
			// gamsScore ㅇㅣㄹ정 값 되면 update interval 제거
			
			/*
			 * 게임 중 연결 끊은 경우
			 * 1. 인터벌, 리스너 등 자원 해제
			 * 2. 탈주 패배 기록
			 * 3. disconnected 메세지 브로드캐스팅
			 * 4. 탈주자 소켓 정보 삭제
			 */
			socket.on("disconnect", () => {
				clearInterval(updateInterval);
				clearTimeout(games[socket_infos[socket.id].rid].timeout);
				clearInterval(gameLogic._leftBarMovement);
				clearInterval(gameLogic._rightBarMovement);
				playerRight.socket.removeAllListeners();
				playerLeft.socket.removeAllListeners();

				const match = socket_infos[socket.id].match;
				let loser;
				let winner;
				if (match.lPlayerNickname == socket_infos[socket.id].uid) {
					loser = match.lPlayerNickname;
					winner = match.rPlayerNickname;
					this.matchService.createMatch(winner, loser, gameLogic._score[0], gameLogic._score[1], 'normal', 0);
					playerRight.socket.emit('matchEnd', 'WIN');
				} else {
					loser = match.rPlayerNickname;
					winner = match.lPlayerNickname;
					this.matchService.createMatch(winner, loser, gameLogic._score[1], gameLogic._score[0], 'normal', 0);
					playerLeft.socket.emit('matchEnd', 'WIN');
				}
				delete games[socket_infos[socket.id].rid];
				delete socket_infos[socket.id];
			})
		}
		console.log('waiting:', normal_waiting);
  }

	gameInterval(userInfo, playerLeft, playerRight, updateInterval, gameLogic, socket) {
		if (gameLogic._score == Scored.PLAYER00) {
			console.log("left win");
			userInfo.lPlayerScore++;
			gameLogic.initGame();
			playerLeft.socket.emit('setMatchInfo', userInfo);
			playerRight.socket.emit('setMatchInfo', userInfo);
			clearInterval(updateInterval);
			if (userInfo.lPlayerScore == 3
				|| userInfo.rPlayerScore == 3
				|| (userInfo.lPlayerScore + userInfo.rPlayerScore) >= 5) {
					playerLeft.socket.emit('matchEnd', userInfo.lPlayerScore == 3 ? 'WIN' : 'LOSE');
					playerRight.socket.emit('matchEnd', userInfo.rPlayerScore == 3 ? 'WIN' : 'LOSE');
	
					clearInterval(updateInterval);
					clearTimeout(games[socket_infos[socket.id].rid].timeout);
					clearInterval(gameLogic._leftBarMovement);
					clearInterval(gameLogic._rightBarMovement);
					playerRight.socket.removeAllListeners()
					playerLeft.socket.removeAllListeners()
					// 게임 끝남, 전적 DB에 저장, 모달창 닫도록 프론트에 전달, 소켓 연결 끊고 리소스 정리
					// 
				} else {
					console.log("timeout start");
					this.server.to(socket_infos[socket.id].rid).emit("startCount");
					games[socket_infos[socket.id].rid].timeout = setTimeout(() => {
						updateInterval = setInterval(() => {
							this.gameInterval(userInfo, playerLeft, playerRight, updateInterval, gameLogic, socket);
						}, 20)
						console.log("timeout end");
					}, 3000)
				}
		} else if (gameLogic._score == Scored.PLAYER01) {
			console.log("right win");
			userInfo.rPlayerScore++;
			gameLogic.initGame();
			playerLeft.socket.emit('setMatchInfo', userInfo);
			playerRight.socket.emit('setMatchInfo', userInfo);
			clearInterval(updateInterval);
			if (userInfo.lPlayerScore == 3
				|| userInfo.rPlayerScore == 3
				|| (userInfo.lPlayerScore + userInfo.rPlayerScore) >= 5) {
					playerLeft.socket.emit('matchEnd', userInfo.lPlayerScore == 3 ? 'WIN' : 'LOSE');
					playerRight.socket.emit('matchEnd', userInfo.rPlayerScore == 3 ? 'WIN' : 'LOSE');
	
					clearInterval(updateInterval);
					clearTimeout(games[socket_infos[socket.id].rid].timeout);
					clearInterval(gameLogic._leftBarMovement);
					clearInterval(gameLogic._rightBarMovement);
					playerRight.socket.removeAllListeners()
					playerLeft.socket.removeAllListeners()
					// 게임 끝남, 전적 DB에 저장, 모달창 닫도록 프론트에 전달, 소켓 연결 끊고 리소스 정리
					// 
				} else {
					console.log("timeout start");
					this.server.to(socket_infos[socket.id].rid).emit("startCount");
					games[socket_infos[socket.id].rid].timeout = setTimeout(() => {
						updateInterval = setInterval(() => {
							this.gameInterval(userInfo, playerLeft, playerRight, updateInterval, gameLogic, socket);
						}, 20)
						console.log("timeout end");
					}, 3000)
				}
		} else {
			// frontㅇㅔ서 준비 완료되면 시작(3, 2, 1, Start 메시지)
			gameLogic.update();
			playerLeft.socket.emit("update", gameLogic.getJson());
			playerRight.socket.emit("update", gameLogic.getJson());	
		}
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
		console.log('Game 웹소켓 연결 해제', socket_infos[socket.id]?.uid);
		if (!socket_infos[socket.id]?.rid) {
			for (let i = 0; i < normal_waiting.length; i++) {
				if (normal_waiting[i].socket.id === socket.id)  {
					console.log('delete waiting queue', socket_infos[socket.id]?.uid);
					normal_waiting.splice(i, 1);
					i--;
					delete socket_infos[socket.id];

					return ;
				}
			}
		}
	}
}