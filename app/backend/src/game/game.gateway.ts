import { Query, Req, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConnectedSocket, MessageBody, OnGatewayDisconnect } from '@nestjs/websockets';
import { WebSocketServer, OnGatewayConnection, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Request } from 'express';
import { Server, Socket } from 'socket.io';
import { LoggedInWsGuard } from 'src/auth/logged-in-ws.guard';
import { GameMapDto, SpectateGameDto } from 'src/dto/game';
import { WsExceptionFilter } from 'src/filter/ws.filter';
import * as globalService_1 from 'src/global/global.service';
import { MatchService } from 'src/match/match.service';
import { SessionService } from 'src/session/session.service';
import { UsersService } from 'src/users/users.service';
import { Scored, GameLogic } from './game.logic';

interface User {
	id: string,
	socket: Socket,
	map: Number,
}

type MatchType = 'normal' | 'ladder';

interface MatchInfo {
  lPlayerNickname: string,
  lPlayerAvatarUrl: string,
  lPlayerScore: number,
  rPlayerNickname: string,
  rPlayerAvatarUrl: string,
  rPlayerScore: number,
  viewNumber: number,
	type: MatchType,
	map: number,
}

interface socketInfo {
	socket: Socket,
	sid: string, // session id
	uid: string, // user id
	rid: string, // room id
	match: MatchInfo,
	logic: GameLogic,
}

interface Game {
	timeout: NodeJS.Timeout,
	interval: NodeJS.Timeout,
	type: MatchType;
	map: number;
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
@UseFilters(WsExceptionFilter)
@UsePipes(new ValidationPipe())
@WebSocketGateway({ namespace: 'game', cors: true })
export class GameGateway {
	constructor(
		private sessionService: SessionService, // readUserId 함수 쓰려고 가져옴
		private usersService: UsersService,
		private matchService: MatchService,
		private globalService: globalService_1.GlobalService,
	) {}

	@WebSocketServer()public server: Server;

	private normal_queue: User[] = [];
	private ladder_queue: User[] = [];
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

 GiveUpEventListener (playerLeft: User, playerRight: User, gameLogic: GameLogic, position: Position) {
		const room_id = this.socket_infos[playerLeft.socket.id].rid;
		const winner = position == 'l' ? playerRight : playerLeft;
		const loser = position == 'l' ? playerLeft : playerRight;
		this.saveResult(winner, loser, gameLogic._score[1], gameLogic._score[0], room_id);
		loser.socket.emit('matchEnd', 'LOSE');
		winner.socket.emit('matchEnd', 'WIN');
		this.clearGame(playerLeft, playerRight, room_id, gameLogic);
	}

	saveResult(winner: User, loser: User, winner_score: number, loser_score: number, room_id: string) {
		this.matchService.createMatch(winner.id, loser.id, winner_score, loser_score, this.games[room_id].type, this.games[room_id].map);
		if (this.games[room_id].type == 'ladder') {
			this.matchService.updateLadderScore(winner.id, 100);
			this.matchService.updateLadderScore(loser.id, -100);
		}
	}

	prepareNextRound(userInfo: MatchInfo, playerLeft: User, playerRight: User, gameLogic: GameLogic) {
		gameLogic.initGame();
		const room_id = this.socket_infos[playerLeft.socket.id].rid;
		this.server.to(room_id).emit('setMatchInfo', userInfo);
		clearInterval(this.games[room_id].interval);
		if (userInfo.lPlayerScore == 3 || userInfo.rPlayerScore == 3 || (userInfo.lPlayerScore + userInfo.rPlayerScore) >= 5) {
				const winner = userInfo.lPlayerScore == 3 ? playerLeft : playerRight;
				const loser = userInfo.lPlayerScore == 3 ? playerRight : playerLeft;
				winner.socket.emit('matchEnd', 'WIN');
				loser.socket.emit('matchEnd', 'LOSE');
				this.saveResult(winner, loser, gameLogic._score[1], gameLogic._score[0], room_id);
				this.clearGame(playerLeft, playerRight, room_id, gameLogic);
			} else {
				this.server.to(room_id).emit("startCount");
				this.games[room_id].timeout = setTimeout(() => {
					this.games[room_id].interval = setInterval(() => {
						this.gameInterval(userInfo, playerLeft, playerRight, gameLogic);
					}, 20)
				}, 3000)
			}
	}

	gameInterval = (userInfo: MatchInfo, playerLeft: User, playerRight: User, gameLogic: GameLogic) => {
		if (gameLogic._score == Scored.PLAYER00) {
			userInfo.lPlayerScore++;
			this.prepareNextRound(userInfo, playerLeft, playerRight, gameLogic);
		} else if (gameLogic._score == Scored.PLAYER01) {
			userInfo.rPlayerScore++;
			this.prepareNextRound(userInfo, playerLeft, playerRight, gameLogic);
		} else {
			// frontㅇㅔ서 준비 완료되면 시작(3, 2, 1, Start 메시지)
			gameLogic.update();
			const room_id = this.socket_infos[playerLeft.socket.id].rid;
			this.server.to(room_id).emit("update", gameLogic.getJson());
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

		this.saveResult(winner, loser, gameLogic._score[1], gameLogic._score[0], room_id);
		winner.socket.emit('matchEnd', 'WIN');
		this.clearGame(left_player, right_player, room_id, gameLogic);
	}

	deleteFromNormalQueue(user_id: string) {
		const idx = this.normal_queue.findIndex((element) => {
			if (element.id = user_id) {
				return true;
			}
			return false;
		})
		if (idx != -1) {
			this.normal_queue.splice(idx, 1);
		}
	}

	deleteFromLadderQueue(user_id: string) {
		const idx = this.ladder_queue.findIndex((element) => {
			if (element.id = user_id) {
				return true;
			}
			return false;
		})
		if (idx != -1) {
			this.ladder_queue.splice(idx, 1);
		}
	}

	
  @SubscribeMessage('normal')
  async handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() map: GameMapDto) {
		try {
			const map_type = Number(map.map);
			const game_type = 'normal';
			// 1. 소켓 유저 정보 가져오기
			// 쿠키에서 sid 파싱
			const sid: string = this.globalService.getSessionIDFromCookie(socket.request.headers.cookie);
			// sid로 유저 아이디 찾기
			const userid = await this.sessionService.readUserId(sid);
	
			// 2. 소켓 관련 정보들 저장 (소켓, 세션id, 유저id)
			this.socket_infos[socket.id] = {socket: socket, sid: sid, uid: userid, rid: null, match: null, logic: null};
			// 3. 대기열에 넣기 (이미 큐에 있다면 넣지 않음)
			if (this.normal_queue.find((element) => {
				if (element.id == userid) {
					return true;
				}
				return false;
			})) {
			} else {
				this.normal_queue.push({id: userid, socket: socket, map: map_type})
			}
			// 4. 같은 맵을 선택하고 기다리는중인 사람들 리스트 가져오기
			const waiters = this.normal_queue.filter((element) => element.map == map_type);
			if (waiters.length >= 2) {
				
				// 5. 게임 로직 객체 생성
				const gameLogic = new GameLogic(700, 450, Number(map.map), this.server);
				const playerLeft = waiters[0];
				const playerRight = waiters[1];
	
				const room_id: string = playerLeft.id + playerRight.id;
				this.socket_infos[playerLeft.socket.id].rid = room_id;
				this.socket_infos[playerLeft.socket.id].logic = gameLogic;
				this.socket_infos[playerRight.socket.id].rid = room_id;
				this.socket_infos[playerRight.socket.id].logic = gameLogic;
				
				playerLeft.socket.join(room_id);
				playerRight.socket.join(room_id);
				playerLeft.socket.emit('matched', {roomId: room_id, opponent: this.normal_queue[1].id, position: 'left'});
				playerRight.socket.emit('matched', {roomId: room_id, opponent: this.normal_queue[0].id, position: 'right'});
				this.deleteFromNormalQueue(waiters[0].id);
				this.deleteFromNormalQueue(waiters[1].id);
	
				const ret = gameLogic.getJson();
				const userInfo: MatchInfo = {
					lPlayerNickname: playerLeft.id,
					lPlayerAvatarUrl: await this.usersService.getAvatarUrl(playerLeft.id),
					lPlayerScore: 0,
					rPlayerNickname: playerRight.id,
					rPlayerAvatarUrl: await this.usersService.getAvatarUrl(playerRight.id),
					rPlayerScore: 0,
					viewNumber: 0,
					type: game_type,
					map: 0,
				}
				this.socket_infos[playerLeft.socket.id].match = userInfo;
				this.socket_infos[playerRight.socket.id].match = userInfo;
	
				this.server.to(room_id).emit("init", gameLogic.getInitJson(), userInfo);
				this.server.to(room_id).emit("setMatchInfo", userInfo);				
				playerLeft.socket.on('keyEvent', (e) => this.BarMovementEventListner(e, gameLogic, 'l'));
				playerRight.socket.on('keyEvent', (e) => this.BarMovementEventListner(e, gameLogic, 'r'));
	
				/*
				 * @brief 기권 버튼 클릭시 결과 전송 후 게임 종료
				*/
				
				playerLeft.socket.on("giveUp", () => this.GiveUpEventListener(playerLeft, playerRight, gameLogic, 'l'));
				playerRight.socket.on("giveUp", () => this.GiveUpEventListener(playerLeft, playerRight, gameLogic, 'r'));
	
				this.games[room_id] = {timeout: null, interval: null, type: game_type, map: map_type};
				this.server.to(room_id).emit("startCount");
				this.games[room_id].timeout = setTimeout(() => {
					this.games[room_id].interval = setInterval(() => {
						this.gameInterval(userInfo, playerLeft, playerRight, gameLogic);
					}, 20)
				}, 3000)
				
				/*
				 * 게임 중 연결 끊은 경우
				 */
				playerLeft.socket.on("disconnect", () => this.disconnectEvent('l', playerLeft, playerRight, gameLogic));
				playerRight.socket.on("disconnect", () => this.disconnectEvent('r', playerLeft, playerRight, gameLogic));
			}
		} catch (err) {
			console.error(err);
		}
  }

	@SubscribeMessage('ladder')
	async handdleMessage(@ConnectedSocket() socket: Socket, @MessageBody() map: GameMapDto) {
		try {
			const map_type = Number(map);
			const game_type = 'ladder';
			// 쿠키에서 sid 파싱
			const sid: string = this.globalService.getSessionIDFromCookie(socket.request.headers.cookie);
			// sid로 유저 아이디 찾기
			const userid = await this.sessionService.readUserId(sid);
	
			this.socket_infos[socket.id] = {socket: socket, sid: sid, uid: userid, rid: null, match: null, logic: null};
			// 큐에 넣기
			if (this.ladder_queue.find((element) => {
				if (element.id == userid) {
					return true;
				}
				return false;
			})) {
			} else {
				this.ladder_queue.push({id: userid, socket: socket, map: map_type})
			}
			// 같은 맵을 선택하고 기다리는중인 사람들 리스트
			const waiters = this.ladder_queue.filter((element) => element.map == map_type);
			if (waiters.length >= 2) {
				const gameLogic = new GameLogic(700, 450, Number(map), this.server);
				const playerLeft = waiters[0];
				const playerRight = waiters[1];
	
				const room_id: string = playerLeft.id + playerRight.id;
				this.socket_infos[playerLeft.socket.id].rid = room_id;
				this.socket_infos[playerLeft.socket.id].logic = gameLogic;
				this.socket_infos[playerRight.socket.id].rid = room_id;
				this.socket_infos[playerRight.socket.id].logic = gameLogic;
				playerLeft.socket.join(room_id);
				playerRight.socket.join(room_id);
				playerLeft.socket.emit('matched', {roomId: room_id, opponent: this.ladder_queue[1].id, position: 'left'});
				playerRight.socket.emit('matched', {roomId: room_id, opponent: this.ladder_queue[0].id, position: 'right'});
				this.deleteFromLadderQueue(waiters[0].id);
				this.deleteFromLadderQueue(waiters[1].id);
	
				const ret = gameLogic.getJson();
				const userInfo: MatchInfo = {
					lPlayerNickname: playerLeft.id,
					lPlayerAvatarUrl: await this.usersService.getAvatarUrl(playerLeft.id),
					lPlayerScore: 0,
					rPlayerNickname: playerRight.id,
					rPlayerAvatarUrl: await this.usersService.getAvatarUrl(playerRight.id),
					rPlayerScore: 0,
					viewNumber: 0,
					type: 'ladder',
					map: 0,
				}
				this.socket_infos[playerLeft.socket.id].match = userInfo;
				this.socket_infos[playerRight.socket.id].match = userInfo;
	
				this.server.to(room_id).emit("init", gameLogic.getInitJson(), userInfo);
	
				playerLeft.socket.emit('setMatchInfo', userInfo );
				playerRight.socket.emit('setMatchInfo', userInfo );
				playerLeft.socket.on('keyEvent', (e) => this.BarMovementEventListner(e, gameLogic, 'l'));
				playerRight.socket.on('keyEvent', (e) => this.BarMovementEventListner(e, gameLogic, 'r'));
	
				/*
				 * @brief 기권 버튼 클릭시 결과 전송 후 게임 종료
				*/
				
				playerLeft.socket.on("giveUp", () => this.GiveUpEventListener(playerLeft, playerRight, gameLogic, 'l'));
				playerRight.socket.on("giveUp", () => this.GiveUpEventListener(playerLeft, playerRight, gameLogic, 'r'));
	
				this.games[room_id] = {timeout: null, interval: null, type: game_type, map: map_type};
				this.server.to(room_id).emit("startCount");
				this.games[room_id].timeout = setTimeout(() => {
					this.games[room_id].interval = setInterval(() => {
						this.gameInterval(userInfo, playerLeft, playerRight, gameLogic);
					}, 20)
				}, 3000)
				
				/*
				 * 게임 중 연결 끊은 경우
				 */
				playerLeft.socket.on("disconnect", () => this.disconnectEvent('l', playerLeft, playerRight, gameLogic));
				playerRight.socket.on("disconnect", () => this.disconnectEvent('r', playerLeft, playerRight, gameLogic));
			}
		} catch (err) {
			console.error(err);
		}
	}

	getSocketInfo(target_id: string) {
		for (let key in this.socket_infos) {
			if (this.socket_infos[key].uid == target_id) {
				return this.socket_infos[key];
			}
		}
		throw ("이 유저는 게임중이 아닙니다.");
	}

	@SubscribeMessage('spectate')
	async spectateMessage(@ConnectedSocket() socket: Socket, @MessageBody() body: SpectateGameDto) {
		// 1. 관전 할 대상의 게임 room_id 확인
		try {
			console.log("Spectate |", body.nick);
			const target_info = await this.usersService.getUserInfoWithNick(body.nick);
			const socket_info = this.getSocketInfo(target_info.user_id);
	
			// 2. 초기화
			console.log('관전하기 |', socket_info.logic.getInitJson(), socket_info.match);
			socket.emit("init", socket_info.logic.getInitJson(), socket_info.match);
			socket.emit("setMatchInfo", socket_info.match);
			
			// 3. 같은 소켓 room에 접속시키기 (게임 인터벌에서 해당 룸으로 메세지를 쏴준다)
			socket.join(socket_info.rid);
		} catch (err) {
			console.log(err);
			return (err);
		}

		
	}

	afterInit(server: Server): any {
		console.log('Game Socket Server Init');
	}

	async handleConnection(@ConnectedSocket() socket: Socket) {
		try {
			const sid = this.globalService.getSessionIDFromCookie(socket.request.headers.cookie);
			const user_id = await this.sessionService.readUserId(sid);
			console.log('Game 웹소켓 연결됨', user_id);
		} catch (err) {
			console.error(err);
		}
	}

	async handleDisconnect(@ConnectedSocket() socket: Socket) {
		try {
			const sid = this.globalService.getSessionIDFromCookie(socket.request.headers.cookie);
			const user_id = await this.sessionService.readUserId(sid);
	
			console.log('Game 웹소켓 연결해제', user_id);
			// 1. 대기열에 있다면 대기열에서 제거
			this.deleteFromNormalQueue(user_id);
			this.deleteFromLadderQueue(user_id);

			// socket.leave(this.socket_infos)
		} catch (err) {
			console.error(err);
		}
	}
}