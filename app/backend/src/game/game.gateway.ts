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

interface User {
	id: string,
	socket: Socket,
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
	interval: NodeJS.Timeout,
}

interface GameInfo {
	game: Game,
	gameLogic: GameLogic,
	lPlayer: User,
	rPlayer: User,
	room_id: string,
}

type Position = 'l' | 'r';

var normal_queue: User[] = [];
var socket_infos: {[key: string]: socketInfo} = {};
var games: {[key: string]: Game} = {};

const BarMovementEventListner = (e: any, game_logic: GameLogic, user_position: Position) => {
	const position = user_position == 'l' ? true : false;
	if (e.arrowDown === true) { // 아랫키가 눌리면 아래로 이동하는 인터벌을 생성한다.
		game_logic.moveBar(false, position);
	} else if (e.arrowDown === false) { // 아래키가 떼어지면 아래로 이동하던 인터벌을 제거한다.
		clearInterval(game_logic._leftBarMovement);
		if (e.arrowUp === 1) { // Down키가 떼어졌는데 Up키가 이미 눌려진 상태라면, 위로 이동하는 인터벌을 생성.
			game_logic.moveBar(true, position);
		}
	}
	if (e.arrowUp === true) {
		game_logic.moveBar(true, position);
	} else if (e.arrowUp === false) {
		clearInterval(game_logic._leftBarMovement);
		if (e.arrowDown === 1) {
			game_logic.moveBar(false, position);
		}
	}
}

const ClearGameInterval = (game: Game) => {
	clearInterval(game.interval);
	clearTimeout(game.timeout);
}

const ClearGameLogicInterval = (gameLogic: GameLogic) => {
	clearInterval(gameLogic._leftBarMovement);
	clearInterval(gameLogic._rightBarMovement);
}

const ClearIntervals = (game: Game, gameLogic: GameLogic) => {
	ClearGameInterval(game);
	ClearGameLogicInterval(gameLogic);
}
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
		if (normal_queue.find((element) => {
			if (element.id == userid) {
				return true;
			}
			return false;
		})) {
			console.log('중복 대기열:', userid);
		} else {
			normal_queue.push({id: userid, socket: socket})
		}
		
		// 2인 이상시 매칭
		if (normal_queue.length >= 2) {
			console.log('매칭 완료');
			
			const gameLogic = new GameLogic(700, 450, 2, this.server);
			const playerLeft = normal_queue[0];
			const playerRight = normal_queue[1];

			const room_id: string = playerLeft.id + playerRight.id;
			socket_infos[playerLeft.socket.id].rid = room_id;
			socket_infos[playerRight.socket.id].rid = room_id;
			playerLeft.socket.join(room_id);
			playerRight.socket.join(room_id);
			playerLeft.socket.emit('matched', {roomId: room_id, opponent: normal_queue[1].id, position: 'left'});
			playerRight.socket.emit('matched', {roomId: room_id, opponent: normal_queue[0].id, position: 'right'});
			normal_queue.splice(0, 2); // 대기열에서 제거

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

			this.server.to(room_id).emit("init", gameLogic.getInitJson(), userInfo);

			playerLeft.socket.emit('setMatchInfo', {...userInfo, myName: userInfo.lPlayerNickname} );
			playerRight.socket.emit('setMatchInfo', {...userInfo, myName: userInfo.rPlayerNickname} );
			playerLeft.socket.on('keyEvent', (e) => BarMovementEventListner(e, gameLogic, 'l'));
			playerRight.socket.on('keyEvent', (e) => BarMovementEventListner(e, gameLogic, 'r'));

			/*
			 * @brief 기권 버튼 클릭시 결과 전송 후 게임 종료
			*/
			playerLeft.socket.on("giveUp", () => {
				this.matchService.createMatch(playerRight.id, playerLeft.id, gameLogic._score[1], gameLogic._score[0], 'normal', 0);
				playerLeft.socket.emit('matchEnd', 'LOSE');
				playerRight.socket.emit('matchEnd', 'WIN');
				ClearIntervals(games[room_id], gameLogic);
				playerRight.socket.removeAllListeners();
				playerLeft.socket.removeAllListeners();
			})

			playerRight.socket.on("giveUp", () => {
				this.matchService.createMatch(playerLeft.id, playerRight.id, gameLogic._score[0], gameLogic._score[1], 'normal', 0);
				playerLeft.socket.emit('matchEnd', 'WIN');
				playerRight.socket.emit('matchEnd', 'LOSE');
				ClearIntervals(games[room_id], gameLogic);
				playerRight.socket.removeAllListeners();
				playerLeft.socket.removeAllListeners();
			})
			console.log("timeout start");

			games[room_id] = {timeout: null, interval: null};
			this.server.to(room_id).emit("startCount");
			games[room_id].timeout = setTimeout(() => {
				games[room_id].interval = setInterval(() => {
					gameInterval(userInfo, playerLeft, playerRight, room_id, gameLogic, socket);
				}, 20)
				console.log("timeout end");
			}, 3000)
			
			/*
			 * 게임 중 연결 끊은 경우
			 * 1. 인터벌, 리스너 등 자원 해제
			 * 2. 탈주 패배 기록
			 * 3. disconnected 메세지 브로드캐스팅
			 * 4. 탈주자 소켓 정보 삭제
			 */
			playerLeft.socket.on("disconnect", () => {
				
				console.log('Game 웹소켓 연결 해제됨', playerLeft.socket.id, socket_infos[playerLeft.socket.id]?.uid);

				const match = socket_infos[playerLeft.socket.id].match;
				let loser;
				let winner;
				loser = match.lPlayerNickname;
				winner = match.rPlayerNickname;
				this.matchService.createMatch(winner, loser, gameLogic._score[0], gameLogic._score[1], 'normal', 0);
				playerRight.socket.emit('matchEnd', 'WIN');

				// playerRight.socket.disconnect();
				ClearIntervals(games[room_id], gameLogic);
				playerRight.socket.removeAllListeners();
				playerLeft.socket.removeAllListeners();
				delete games[socket_infos[playerLeft.socket.id].rid];
				delete socket_infos[playerLeft.socket.id];
				console.log('Game 연결중인 소켓 정보', socket_infos);
			})

			playerRight.socket.on("disconnect", () => {
				console.log('Game 웹소켓 연결 해제됨', socket_infos[playerRight.socket.id]?.uid);

				ClearIntervals(games[room_id], gameLogic);
				playerRight.socket.removeAllListeners();
				playerLeft.socket.removeAllListeners();

				const match = socket_infos[playerRight.socket.id].match;
				let loser;
				let winner;
				loser = match.rPlayerNickname;
				winner = match.lPlayerNickname;
				this.matchService.createMatch(winner, loser, gameLogic._score[1], gameLogic._score[0], 'normal', 0);
				playerLeft.socket.emit('matchEnd', 'WIN');
				delete games[socket_infos[playerRight.socket.id].rid];
				delete socket_infos[playerRight.socket.id];
				console.log('Game 연결중인 소켓 정보', socket_infos);
			})

		}
		console.log('대기열 인원 수:', normal_queue.length);

		const gameInterval = (userInfo, playerLeft, playerRight, room_id, gameLogic, socket) => {
			if (gameLogic._score == Scored.PLAYER00) {
				console.log("left win");
				userInfo.lPlayerScore++;
				gameLogic.initGame();
				playerLeft.socket.emit('setMatchInfo', userInfo);
				playerRight.socket.emit('setMatchInfo', userInfo);
				clearInterval(games[room_id].interval);
				if (userInfo.lPlayerScore == 3
					|| userInfo.rPlayerScore == 3
					|| (userInfo.lPlayerScore + userInfo.rPlayerScore) >= 5) {
						playerLeft.socket.emit('matchEnd', userInfo.lPlayerScore == 3 ? 'WIN' : 'LOSE');
						playerRight.socket.emit('matchEnd', userInfo.rPlayerScore == 3 ? 'WIN' : 'LOSE');
						ClearIntervals(games[room_id], gameLogic);
						playerRight.socket.removeAllListeners()
						playerLeft.socket.removeAllListeners()
						// 게임 끝남, 전적 DB에 저장, 모달창 닫도록 프론트에 전달, 소켓 연결 끊고 리소스 정리
						// 
					} else {
						console.log("timeout start");
						this.server.to(room_id).emit("startCount");
						games[room_id].timeout = setTimeout(() => {
							games[room_id].interval = setInterval(() => {
								gameInterval(userInfo, playerLeft, playerRight, room_id, gameLogic, socket);
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
				clearInterval(games[room_id].interval);
				if (userInfo.lPlayerScore == 3
					|| userInfo.rPlayerScore == 3
					|| (userInfo.lPlayerScore + userInfo.rPlayerScore) >= 5) {
						playerLeft.socket.emit('matchEnd', userInfo.lPlayerScore == 3 ? 'WIN' : 'LOSE');
						playerRight.socket.emit('matchEnd', userInfo.rPlayerScore == 3 ? 'WIN' : 'LOSE');
						ClearIntervals(games[room_id], gameLogic);
						playerRight.socket.removeAllListeners()
						playerLeft.socket.removeAllListeners()
						// 게임 끝남, 전적 DB에 저장, 모달창 닫도록 프론트에 전달, 소켓 연결 끊고 리소스 정리
						// 
					} else {
						console.log("timeout start");
						this.server.to(socket_infos[socket.id].rid).emit("startCount");
						games[socket_infos[socket.id].rid].timeout = setTimeout(() => {
							games[room_id].interval = setInterval(() => {
								gameInterval(userInfo, playerLeft, playerRight, room_id, gameLogic, socket);
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
  }

	

	@SubscribeMessage('ladder')
	async handdleMessage(@ConnectedSocket() socket: Socket) {
		
	}

	afterInit(server: Server): any {
		console.log('Game Socket Server Init');
	}

	async handleConnection(@ConnectedSocket() socket: Socket) {
		console.log('Game 웹소켓 연결됨', socket.id);
	}

	handleDisconnect(@ConnectedSocket() socket: Socket) {
		const isSameSocketID = (element) => {
			if (element.socket.id == socket.id) {
				return true;
			}
			return false;
		}

		// 대기열에 있다면 대기열에서 제거
		const idx = normal_queue.findIndex(isSameSocketID);
		if (idx != -1) {
			normal_queue.splice(idx, 1);
		}
	}
}