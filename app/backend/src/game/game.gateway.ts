import { Req } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConnectedSocket, MessageBody, OnGatewayDisconnect } from '@nestjs/websockets';
import { WebSocketServer, OnGatewayConnection, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Request } from 'express';
import { Server, Socket } from 'socket.io';
import { GlobalService } from 'src/global/global.service';
import { MatchService } from 'src/match/match.service';
import { SessionService } from 'src/session/session.service';
import { UsersService } from 'src/users/users.service';
import { Scored, GameLogic } from './game.logic';

interface User {
	id: string,
	socket: Socket,
}

type MatchType = 'normal' | 'ladder';

type MapType = 0 | 1 | 2;

interface MatchInfo {
  lPlayerNickname: string,
  lPlayerAvatarUrl: string,
  lPlayerScore: number,
  rPlayerNickname: string,
  rPlayerAvatarUrl: string,
  rPlayerScore: number,
  viewNumber: number,
	type: MatchType,
	map: MapType,
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
	match_info: MatchInfo,
	left_player: User,
	right_player: User,
	room_id: string,
}

type Position = 'l' | 'r';

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
		private globalService: GlobalService,
	) {}

	@WebSocketServer()public server: Server;

	private normal_queue: User[] = [];
	private socket_infos: {[key: string]: socketInfo} = {};
	private games: {[key: string]: Game} = {};

	clearGameInterval(game: Game) {
		clearInterval(game.interval);
		clearTimeout(game.timeout);
	}

	clearGameLogicInterval(gameLogic: GameLogic) {
		clearInterval(gameLogic._leftBarMovement);
		clearInterval(gameLogic._rightBarMovement);
	}
	
	clearIntervals(game: Game, gameLogic: GameLogic) {
		this.clearGameInterval(game);
		this.clearGameLogicInterval(gameLogic);
	}

	BarMovementEventListner(e: any, game_logic: GameLogic, user_position: Position) {
		const position = user_position == 'l' ? true : false;
		if (e.arrowDown === true) { // 아랫키가 눌리면 아래로 이동하는 인터벌을 생성한다.
			game_logic.moveBar(false, position);
		} else if (e.arrowDown === false) { // 아래키가 떼어지면 아래로 이동하던 인터벌을 제거한다.
			clearInterval(position ? game_logic._leftBarMovement : game_logic._rightBarMovement);
			if (e.arrowUp === 1) { // Down키가 떼어졌는데 Up키가 이미 눌려진 상태라면, 위로 이동하는 인터벌을 생성.
				game_logic.moveBar(true, position);
			}
		}
		if (e.arrowUp === true) {
			game_logic.moveBar(true, position);
		} else if (e.arrowUp === false) {
			clearInterval(position ? game_logic._leftBarMovement : game_logic._rightBarMovement);
			if (e.arrowDown === 1) {
				game_logic.moveBar(false, position);
			}
		}
	}

 GiveUpEventListener (playerLeft: User, playerRight: User, room_id: string, gameLogic: GameLogic, game_type: string, map: number, position: Position) {
		const winner = position == 'l' ? playerRight : playerLeft;
		const loser = position == 'l' ? playerLeft : playerRight;
		this.matchService.createMatch(winner.id, loser.id, gameLogic._score[1], gameLogic._score[0], 'normal', 0);
		loser.socket.emit('matchEnd', 'LOSE');
		winner.socket.emit('matchEnd', 'WIN');
		this.clearGame(playerLeft, playerRight, room_id, gameLogic);
	}

	prepareNextRound(userInfo: MatchInfo, playerLeft: User, playerRight: User, room_id: string, gameLogic: GameLogic) {
		gameLogic.initGame();
		this.server.to(room_id).emit('setMatchInfo', userInfo);
		clearInterval(this.games[room_id].interval);
		if (userInfo.lPlayerScore == 3 || userInfo.rPlayerScore == 3 || (userInfo.lPlayerScore + userInfo.rPlayerScore) >= 5) {
				playerLeft.socket.emit('matchEnd', userInfo.lPlayerScore == 3 ? 'WIN' : 'LOSE');
				playerRight.socket.emit('matchEnd', userInfo.rPlayerScore == 3 ? 'WIN' : 'LOSE');
				this.clearGame(playerLeft, playerRight, room_id, gameLogic);
			} else {
				console.log("timeout start");
				this.server.to(room_id).emit("startCount");
				this.games[room_id].timeout = setTimeout(() => {
					this.games[room_id].interval = setInterval(() => {
						this.gameInterval(userInfo, playerLeft, playerRight, room_id, gameLogic);
					}, 20)
					console.log("timeout end");
				}, 3000)
			}
	}

	gameInterval = (userInfo: MatchInfo, playerLeft: User, playerRight: User, room_id: string, gameLogic: GameLogic) => {
		if (gameLogic._score == Scored.PLAYER00) {
			console.log("left win");
			userInfo.lPlayerScore++;
			this.prepareNextRound(userInfo, playerLeft, playerRight, room_id, gameLogic);
		} else if (gameLogic._score == Scored.PLAYER01) {
			console.log("right win");
			userInfo.rPlayerScore++;
			this.prepareNextRound(userInfo, playerLeft, playerRight, room_id, gameLogic);
		} else {
			// frontㅇㅔ서 준비 완료되면 시작(3, 2, 1, Start 메시지)
			gameLogic.update();
			playerLeft.socket.emit("update", gameLogic.getJson());
			playerRight.socket.emit("update", gameLogic.getJson());	
		}
	}

	/*
	 * @brief 게임에 할당된 자원 제거
	 * 1. 해당 게임에서 생성됐던 Interval, Timeout 제거
	 * 2. 해당 소켓에 등록된 이벤트 리스너 제거
	 * 3. 소켓 정보와 게임 정보 제거
	 * 4. 소켓 연결 해제
	*/
	clearGame(left_player: User, right_player: User, room_id: string, gameLogic: GameLogic) {
		this.clearIntervals(this.games[room_id], gameLogic);
		left_player.socket.removeAllListeners();
		right_player.socket.removeAllListeners();
		delete this.games[room_id];
		delete this.socket_infos[left_player.socket.id];
		left_player.socket.disconnect();
		right_player.socket.disconnect();
	}

	disconnectEvent(position: Position, left_player: User, right_player: User, gameLogic: GameLogic) {
		const room_id = this.socket_infos[left_player.socket.id].rid;
		const winner = position == 'l' ? right_player : left_player;
		const loser = position == 'l' ? left_player : right_player;

		this.matchService.createMatch(winner.id, loser.id, gameLogic._score[0], gameLogic._score[1], 'normal', 0);
		winner.socket.emit('matchEnd', 'WIN');
		this.clearGame(left_player, right_player, room_id, gameLogic);
	}

  @SubscribeMessage('normal')
  async handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() map: string) {
		// 쿠키에서 sid 파싱
		const sid: string = this.globalService.getSessionIDFromCookie(socket.request.headers.cookie);
		// sid로 유저 아이디 찾기
		const userid = await this.sessionService.readUserId(sid);

		this.socket_infos[socket.id] = {socket: socket, sid: sid, uid: userid, rid: null, match: null};
		// 큐에 넣기
		if (this.normal_queue.find((element) => {
			if (element.id == userid) {
				return true;
			}
			return false;
		})) {
			console.log('중복 대기열:', userid);
		} else {
			this.normal_queue.push({id: userid, socket: socket})
		}
		
		// 2인 이상시 매칭
		if (this.normal_queue.length >= 2) {
			console.log('매칭 완료');
			
			const gameLogic = new GameLogic(700, 450, Number(map), this.server);
			const playerLeft = this.normal_queue[0];
			const playerRight = this.normal_queue[1];

			const room_id: string = playerLeft.id + playerRight.id;
			this.socket_infos[playerLeft.socket.id].rid = room_id;
			this.socket_infos[playerRight.socket.id].rid = room_id;
			playerLeft.socket.join(room_id);
			playerRight.socket.join(room_id);
			playerLeft.socket.emit('matched', {roomId: room_id, opponent: this.normal_queue[1].id, position: 'left'});
			playerRight.socket.emit('matched', {roomId: room_id, opponent: this.normal_queue[0].id, position: 'right'});
			this.normal_queue.splice(0, 2); // 대기열에서 제거

			const ret = gameLogic.getJson();
			const userInfo: MatchInfo = {
				lPlayerNickname: playerLeft.id,
				lPlayerAvatarUrl: await this.usersService.getAvatarUrl(playerLeft.id),
				lPlayerScore: 0,
				rPlayerNickname: playerRight.id,
				rPlayerAvatarUrl: await this.usersService.getAvatarUrl(playerRight.id),
				rPlayerScore: 0,
				viewNumber: 0,
				type: 'normal',
				map: 0,
			}
			this.socket_infos[playerLeft.socket.id].match = userInfo;
			this.socket_infos[playerRight.socket.id].match = userInfo;

			this.server.to(room_id).emit("init", gameLogic.getInitJson(), userInfo);

			playerLeft.socket.emit('setMatchInfo', {...userInfo, myName: userInfo.lPlayerNickname} );
			playerRight.socket.emit('setMatchInfo', {...userInfo, myName: userInfo.rPlayerNickname} );
			playerLeft.socket.on('keyEvent', (e) => this.BarMovementEventListner(e, gameLogic, 'l'));
			playerRight.socket.on('keyEvent', (e) => this.BarMovementEventListner(e, gameLogic, 'r'));

			/*
			 * @brief 기권 버튼 클릭시 결과 전송 후 게임 종료
			*/
			
			playerLeft.socket.on("giveUp", () => this.GiveUpEventListener(playerLeft, playerRight, room_id, gameLogic, 'normal', 0, 'l'));
			playerRight.socket.on("giveUp", () => this.GiveUpEventListener(playerLeft, playerRight, room_id, gameLogic, 'normal', 0, 'r'));
			console.log("timeout start");

			this.games[room_id] = {timeout: null, interval: null};
			this.server.to(room_id).emit("startCount");
			this.games[room_id].timeout = setTimeout(() => {
				this.games[room_id].interval = setInterval(() => {
					this.gameInterval(userInfo, playerLeft, playerRight, room_id, gameLogic);
				}, 20)
				console.log("timeout end");
			}, 3000)
			
			/*
			 * 게임 중 연결 끊은 경우
			 */
			playerLeft.socket.on("disconnect", () => this.disconnectEvent('l', playerLeft, playerRight, gameLogic));
			playerRight.socket.on("disconnect", () => this.disconnectEvent('r', playerLeft, playerRight, gameLogic));

		}
		console.log('대기열 인원 수:', this.normal_queue.length);
  }

	

	@SubscribeMessage('ladder')
	async handdleMessage(@ConnectedSocket() socket: Socket) {
		
	}

	afterInit(server: Server): any {
		console.log('Game Socket Server Init');
	}

	async handleConnection(@ConnectedSocket() socket: Socket) {
		const sid = this.globalService.getSessionIDFromCookie(socket.request.headers.cookie);
		const user_id = await this.sessionService.readUserId(sid);
		
		console.log('Game 웹소켓 연결됨', user_id);
	}

	async handleDisconnect(@ConnectedSocket() socket: Socket) {
		const sid = this.globalService.getSessionIDFromCookie(socket.request.headers.cookie);
		const user_id = await this.sessionService.readUserId(sid);

		console.log('Game 웹소켓 연결해제', user_id);
		const isSameSocketID = (element) => {
			if (element.socket.id == socket.id) {
				return true;
			}
			return false;
		}

		// 대기열에 있다면 대기열에서 제거
		const idx = this.normal_queue.findIndex(isSameSocketID);
		if (idx != -1) {
			this.normal_queue.splice(idx, 1);
		}
	}
}