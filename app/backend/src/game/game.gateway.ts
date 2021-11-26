import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { WebSocketServer, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NormalGameDto, LadderGameDto, SpectateGameDto, InviteGameDto } from 'src/dto/game';
import { WsExceptionFilter } from 'src/filter/ws.filter';
import { MatchService } from 'src/match/match.service';
import { SessionService } from 'src/session/session.service';
import { UsersService } from 'src/users/users.service';
import { getSessionIDFromCookie } from 'src/utils';
import { Scored, GameLogic } from './game.logic';

interface User {
	id: string,
	socket: Socket,
	map: Number,
}

interface InviteUser {
	target_id: string,
	id: string,
	socket: Socket,
	map: Number,
}

type MatchType = 'general' | 'ranked';

type SocketStatus = 'inqueue' | 'ingame' | 'spectate' | 'end';

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
	status: SocketStatus
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
	) {}

	@WebSocketServer()public server: Server;

	private normal_queue: User[] = [];
	private ladder_queue: User[] = [];
	private invite_queue: InviteUser[] = [];
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

	async saveResult(winner: User, loser: User, winner_score: number = 0, loser_score: number = 0, room_id: string) {
		const res = await this.matchService.createMatch(winner.id, loser.id, winner_score, loser_score, this.games[room_id].type, this.games[room_id].map);
		//console.log(res);
	}

	async prepareNextRound(userInfo: MatchInfo, playerLeft: User, playerRight: User, gameLogic: GameLogic) {
		gameLogic.initGame();
		const socket_info = this.socket_infos[playerLeft.socket.id];
		if (socket_info) {
			const room_id = socket_info.rid;
			this.server.to(room_id).emit('setMatchInfo', userInfo);
			clearInterval(this.games[room_id].interval);
			if (userInfo.lPlayerScore == 3 || userInfo.rPlayerScore == 3 || (userInfo.lPlayerScore + userInfo.rPlayerScore) >= 5) {
				const winner = userInfo.lPlayerScore == 3 ? {user: playerLeft, score: userInfo.lPlayerScore} : {user: playerRight, score: userInfo.rPlayerScore};
				const loser = userInfo.lPlayerScore == 3 ? {user: playerRight, score: userInfo.rPlayerScore} : {user: playerLeft, score: userInfo.lPlayerScore};
				this.server.to(room_id).emit('matchEnd', {winner: winner.user.id, loser: loser.user.id});
				//console.log('score', gameLogic._score);
				await this.saveResult(winner.user, loser.user, winner.score, loser.score, room_id);
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
	}

	gameInterval = (userInfo: MatchInfo, playerLeft: User, playerRight: User, gameLogic: GameLogic) => {
		if (gameLogic._score == Scored.PLAYER00) {
			userInfo.lPlayerScore++;
			this.prepareNextRound(userInfo, playerLeft, playerRight, gameLogic);
		} else if (gameLogic._score == Scored.PLAYER01) {
			userInfo.rPlayerScore++;
			this.prepareNextRound(userInfo, playerLeft, playerRight, gameLogic);
		} else {
			// front에서 준비 완료되면 시작(3, 2, 1, Start 메시지)
			gameLogic.update();
			if (this.socket_infos[playerLeft.socket.id]) {
				// 인터벌이 돌면서 socket_infos를 참조하는데, 사용자가 연결을 끊어서 disconnect 이벤트가 발생하면 이 socket_infos에 정보가 삭제되고 인터벌이 제거된다.
				// 인터벌 내부 함수가 돌고있는 중에 소켓 정보가 제거되면 참조하지 못해서 에러가 생긴다.
				// 이를 막기 위해서 if로 한번 체크하고 실행하도록 수정함
				const room_id = this.socket_infos[playerLeft.socket.id].rid;
				this.server.to(room_id).emit("update", gameLogic.getJson());
			}
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
		this.usersService.updateStatus(left_player.id, 'online');
		this.usersService.updateStatus(right_player.id, 'online');
	}
  
	async GiveUpEventListener (playerLeft: User, playerRight: User, gameLogic: GameLogic, position: Position, userInfo: MatchInfo) {
		const socket_info = this.socket_infos[playerLeft.socket.id];
		if (socket_info) {
			const room_id = this.socket_infos[playerLeft.socket.id].rid;
			const winner = position == 'l' ? {user: playerRight, score: userInfo.rPlayerScore} : {user: playerLeft, score: userInfo.lPlayerScore};
			const loser = position == 'l' ? {user: playerLeft, score: userInfo.lPlayerScore} : {user: playerRight, score: userInfo.rPlayerScore};
			
			await this.saveResult(winner.user, loser.user, winner.score, loser.score, room_id);
			this.server.to(room_id).emit('matchEnd', {winner: winner.user.id, loser: loser.user.id});
			this.clearGame(playerLeft, playerRight, room_id, gameLogic);
			this.usersService.updateStatus(playerLeft.id, 'online');
			this.usersService.updateStatus(playerRight.id, 'online');
		}
	 }

	async disconnectEvent(left_player: User, right_player: User, gameLogic: GameLogic, position: Position, userInfo: MatchInfo) {
		const socket_info = position == 'l' ? this.socket_infos[right_player.socket.id] : this.socket_infos[left_player.socket.id];
		if (socket_info) {
			const room_id = socket_info.rid;
			const winner = position == 'l' ? {user: right_player, score: userInfo.rPlayerScore} : {user: left_player, score: userInfo.lPlayerScore};
			const loser = position == 'l' ? {user: left_player, score: userInfo.lPlayerScore} : {user: right_player, score: userInfo.rPlayerScore};
	
			await this.saveResult(winner.user, loser.user, winner.score, loser.score, room_id);
			this.server.to(room_id).emit('matchEnd', {winner: winner.user.id, loser: loser.user.id});
			this.clearGame(left_player, right_player, room_id, gameLogic);
			delete this.socket_infos[socket_info.socket.id];
		}
		this.usersService.updateStatus(left_player.id, 'online');
		this.usersService.updateStatus(right_player.id, 'online');
	}

	deleteFromNormalQueue(user_id: string) {
		const idx = this.normal_queue.findIndex((element) => {
			if (element.id == user_id) {
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
			if (element.id == user_id) {
				return true;
			}
			return false;
		})
		if (idx != -1) {
			this.ladder_queue.splice(idx, 1);
		}
	}

	deleteFromInviteQueue(user_id: string) {
		const idx = this.invite_queue.findIndex((element) => {
			if (element.id == user_id) {
				return true;
			}
			return false;
		})
		if (idx != -1) {
			this.invite_queue.splice(idx, 1);
		}
	}

	pushUserIntoQueue(userid: string, socket: Socket, map_type: number, queue: any[], target_id: string = null) {
		if (queue.find((element) => { // 만약 유저가 이미 다른 대기열에 등록되어 있었다면, 이전 대기열을 지우고 새로운거로 추가
			if (element.id == userid) {
				return true;
			}
			return false;
		})) {
			const idx = queue.findIndex((element) => {
				if (element.id == userid) {
					return true;
				}
				return false;
			})
			if (idx != -1) {
				queue.splice(idx, 1);
			}
		} 
		queue.push({id: userid, socket: socket, map: map_type, target_id: target_id});
	}

	// 1-1) 수락을 기다리는 도중에 취소
	// 1. game socket disconnect
	// 2. invite_queue에서 제거
	// 3. global socket을 통해서 상대에게 매치가 취소되었음을 알림

	// 1-2) 상대방이 거절
	// 1. 

	// 1-3) 상대방이 수락
	// 1. game socket 접속//
	// 2. socket.emit('invite', {map: , target: b의 닉네임})
  // 3. socket.emit('invite', {map: , target: a의 닉네임})
	// 4. 게임 시작

	saveSocketInfo(socket: Socket, session_id: string, user_id: string, status: SocketStatus) {
		for (let sock_id in this.socket_infos) {
			if (this.socket_infos[sock_id].uid == user_id) // 이미 저장된 소켓 정보가 있다면 이전 소켓 정보를 제거
				delete this.socket_infos[sock_id];
		}
		this.socket_infos[socket.id] = {
			socket: socket, 
			sid: session_id, 
			uid: user_id, 
			status: status,
			rid: null, 
			match: null, 
			logic: null
		}
	}

	@SubscribeMessage('invite')
	async inviteGameMessage(@ConnectedSocket() socket: Socket, @MessageBody() body: InviteGameDto) {
		try { // 대전 신청 게임인 경우
			// 1. 대전을 신청하고 게임 소켓에 접속해 수락을 기다린다.
			// 1-1. 기다리는 도중에 취소한다 (소켓 연결 해제) -> 상대방에게 대전 신청 취소 메세지를 보내고 연결 종료
			// 1-2. 상대방이 거절한다 -> 신청한 사람에게 대전 신청 거절 메세지를 보내고 소켓 연결 해제
			// 1-3. 상대방이 수락한다 -> 게임 시작
			const map_type = Number(body.map);
			const game_type = 'general';
			// 1. 소켓 id로 유저 정보 가져오기
			const sid = getSessionIDFromCookie(socket.request.headers.cookie);
			const userid = await this.sessionService.readUserId(sid);
			const target = await this.usersService.getUserInfoWithNick(body.target);

			// 2. 소켓 관련 정보들 저장 (소켓, 세션id, 유저id)
			this.saveSocketInfo(socket, sid, userid, 'inqueue');
			//console.log('소켓저장됨.', userid);

			// 3. 초대 대기열에 넣기
			this.pushUserIntoQueue(userid, socket, map_type, this.invite_queue, target.user_id);

			// 4. 나의 타겟 상대 찾기
			const waiters = this.invite_queue.filter((element) => element.id == target.user_id);

			for (let waiter of waiters) {
				//console.log('waiters', waiters);
				if (waiter.target_id == userid) { // 상대의 타겟이 내가 맞는지 확인
					// 5. 게임 로직 객체 생성
					const gameLogic = new GameLogic(700, 450, map_type, this.server);
					const playerLeft = {
						id: waiter.id,
						socket: waiter.socket,
						map: waiter.map,
					};
					const playerRight = {
						id: userid,
						socket: socket,
						map: map_type,
					};
					this.socket_infos[playerLeft.socket.id].status = 'ingame';
					this.socket_infos[playerRight.socket.id].status = 'ingame';
				
					// 6. 소켓 정보 저장
					const room_id: string = playerLeft.id + playerRight.id;
					//console.log('left', this.socket_infos[playerLeft.socket.id]);
					this.socket_infos[playerLeft.socket.id].rid = room_id;
					this.socket_infos[playerLeft.socket.id].logic = gameLogic;
					//console.log('right', this.socket_infos[playerRight.socket.id])
					this.socket_infos[playerRight.socket.id].rid = room_id;
					this.socket_infos[playerRight.socket.id].logic = gameLogic;
					
					// 7. 게임 room 접속
					playerLeft.socket.join(room_id);
					playerRight.socket.join(room_id);
					this.usersService.updateStatus(playerLeft.id, 'ongame');
					this.usersService.updateStatus(playerRight.id, 'ongame');
					playerLeft.socket.emit('matched', {roomId: room_id, opponent: playerRight.id, position: 'left'});
					playerRight.socket.emit('matched', {roomId: room_id, opponent: playerLeft.id, position: 'right'});
					// invite queue 에서 제거
					this.deleteFromInviteQueue(playerLeft.id);
					this.deleteFromInviteQueue(playerRight.id);

					const userInfo: MatchInfo = {
						lPlayerNickname: (await this.usersService.getUserInfo(playerLeft.id)).nick,
						lPlayerAvatarUrl: await this.usersService.getAvatarUrl(playerLeft.id),
						lPlayerScore: 0,
						rPlayerNickname: (await this.usersService.getUserInfo(playerRight.id)).nick,
						rPlayerAvatarUrl: await this.usersService.getAvatarUrl(playerRight.id),
						rPlayerScore: 0,
						viewNumber: 0,
						type: game_type,
						map: map_type,
					}
					this.socket_infos[playerLeft.socket.id].match = userInfo;
					this.socket_infos[playerRight.socket.id].match = this.socket_infos[playerLeft.socket.id].match;

					this.server.to(room_id).emit("init", gameLogic.getInitJson(), userInfo);
					this.server.to(room_id).emit("setMatchInfo", userInfo);				
					playerLeft.socket.on('keyEvent', (e) => this.BarMovementEventListner(e, gameLogic, 'l'));
					playerRight.socket.on('keyEvent', (e) => this.BarMovementEventListner(e, gameLogic, 'r'));

					/*
					* @brief 기권 버튼 클릭시 결과 전송 후 게임 종료
					*/
					
					playerLeft.socket.on("giveUp", () => this.GiveUpEventListener(playerLeft, playerRight, gameLogic, 'l', userInfo));
					playerRight.socket.on("giveUp", () => this.GiveUpEventListener(playerLeft, playerRight, gameLogic, 'r', userInfo));

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
					playerLeft.socket.on("disconnect", () => this.disconnectEvent(playerLeft, playerRight, gameLogic, 'l', userInfo));
					playerRight.socket.on("disconnect", () => this.disconnectEvent(playerLeft, playerRight, gameLogic, 'r', userInfo));
				}
			} // for문 종료
		} catch (err) {
			console.error(err);
			return err;
		}
	}

  @SubscribeMessage('normal')
  async handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() body: NormalGameDto) {
		try {
			const map_type = Number(body.map);
			const game_type = 'general';
			// 1. 소켓 유저 정보 가져오기
			// 쿠키에서 sid 파싱
			const sid: string = getSessionIDFromCookie(socket.request.headers.cookie);
			// sid로 유저 아이디 찾기
			const userid = await this.sessionService.readUserId(sid);
	
			// 2. 소켓 관련 정보들 저장 (소켓, 세션id, 유저id)
			this.saveSocketInfo(socket, sid, userid, 'inqueue');

			// 3. 대기열에 넣기 (이미 큐에 있다면 넣지 않음)
			this.pushUserIntoQueue(userid, socket, map_type, this.normal_queue);
			// 4. 같은 맵을 선택하고 기다리는중인 사람들 리스트 가져오기
			const waiters = this.normal_queue.filter((element) => element.map == map_type);
			if (waiters.length >= 2) {
				
				// 5. 게임 로직 객체 생성
				const gameLogic = new GameLogic(700, 450, map_type, this.server);
				const playerLeft = waiters[0];
				const playerRight = waiters[1];
				this.socket_infos[playerLeft.socket.id].status = 'ingame';
				this.socket_infos[playerRight.socket.id].status = 'ingame';
	
				const room_id: string = playerLeft.id + playerRight.id;
				this.socket_infos[playerLeft.socket.id].rid = room_id;
				this.socket_infos[playerLeft.socket.id].logic = gameLogic;
				this.socket_infos[playerRight.socket.id].rid = room_id;
				this.socket_infos[playerRight.socket.id].logic = gameLogic;
				
				playerLeft.socket.join(room_id);
				playerRight.socket.join(room_id);
				this.usersService.updateStatus(playerLeft.id, 'ongame');
				this.usersService.updateStatus(playerRight.id, 'ongame');
				playerLeft.socket.emit('matched', {roomId: room_id, opponent: playerRight.id, position: 'left'});
				playerRight.socket.emit('matched', {roomId: room_id, opponent: playerLeft.id, position: 'right'});
				this.deleteFromNormalQueue(playerLeft.id);
				this.deleteFromNormalQueue(playerRight.id);

				const userInfo: MatchInfo = {
					lPlayerNickname: (await this.usersService.getUserInfo(playerLeft.id)).nick,
					lPlayerAvatarUrl: await this.usersService.getAvatarUrl(playerLeft.id),
					lPlayerScore: 0,
					rPlayerNickname: (await this.usersService.getUserInfo(playerRight.id)).nick,
					rPlayerAvatarUrl: await this.usersService.getAvatarUrl(playerRight.id),
					rPlayerScore: 0,
					viewNumber: 0,
					type: game_type,
					map: map_type,
				}
				this.socket_infos[playerLeft.socket.id].match = userInfo;
				this.socket_infos[playerRight.socket.id].match = this.socket_infos[playerLeft.socket.id].match;
	
				this.server.to(room_id).emit("init", gameLogic.getInitJson(), userInfo);
				this.server.to(room_id).emit("setMatchInfo", userInfo);				
				playerLeft.socket.on('keyEvent', (e) => this.BarMovementEventListner(e, gameLogic, 'l'));
				playerRight.socket.on('keyEvent', (e) => this.BarMovementEventListner(e, gameLogic, 'r'));
	
				/*
				 * @brief 기권 버튼 클릭시 결과 전송 후 게임 종료
				*/
				
				playerLeft.socket.on("giveUp", () => this.GiveUpEventListener(playerLeft, playerRight, gameLogic, 'l', userInfo));
				playerRight.socket.on("giveUp", () => this.GiveUpEventListener(playerLeft, playerRight, gameLogic, 'r', userInfo));
	
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
				playerLeft.socket.on("disconnect", () => this.disconnectEvent(playerLeft, playerRight, gameLogic, 'l', userInfo));
				playerRight.socket.on("disconnect", () => this.disconnectEvent(playerLeft, playerRight, gameLogic, 'r', userInfo));
			}
		} catch (err) {
			console.error(err);
		}
  }

	@SubscribeMessage('ladder')
	async handdleMessage(@ConnectedSocket() socket: Socket, @MessageBody() map: LadderGameDto) {
		try {
			const map_type = Number(map.map);
			const game_type = 'ranked';
			// 쿠키에서 sid 파싱
			const sid: string = getSessionIDFromCookie(socket.request.headers.cookie);
			// sid로 유저 아이디 찾기
			const userid = await this.sessionService.readUserId(sid);

			this.saveSocketInfo(socket, sid, userid, 'inqueue');
			// 큐에 넣기
			this.pushUserIntoQueue(userid, socket, map_type, this.ladder_queue);
			// 같은 맵을 선택하고 기다리는중인 사람들 리스트
			const waiters = this.ladder_queue.filter((element) => element.map == map_type);
			if (waiters.length >= 2) {
				const gameLogic = new GameLogic(700, 450, map_type, this.server);
				const playerLeft = waiters[0];
				const playerRight = waiters[1];
				this.socket_infos[playerLeft.socket.id].status = 'ingame';
				this.socket_infos[playerRight.socket.id].status = 'ingame';
	
				const room_id: string = playerLeft.id + playerRight.id;
				this.socket_infos[playerLeft.socket.id].rid = room_id;
				this.socket_infos[playerLeft.socket.id].logic = gameLogic;
				this.socket_infos[playerRight.socket.id].rid = room_id;
				this.socket_infos[playerRight.socket.id].logic = gameLogic;
				playerLeft.socket.join(room_id);
				playerRight.socket.join(room_id);
				this.usersService.updateStatus(playerLeft.id, 'ongame');
				this.usersService.updateStatus(playerRight.id, 'ongame');
				playerLeft.socket.emit('matched', {roomId: room_id, opponent: playerRight.id, position: 'left'});
				playerRight.socket.emit('matched', {roomId: room_id, opponent: playerLeft.id, position: 'right'});
				this.deleteFromLadderQueue(waiters[0].id);
				this.deleteFromLadderQueue(waiters[1].id);
	
				const ret = gameLogic.getJson();
				const userInfo: MatchInfo = {
					lPlayerNickname: (await this.usersService.getUserInfo(playerLeft.id)).nick,
					lPlayerAvatarUrl: await this.usersService.getAvatarUrl(playerLeft.id),
					lPlayerScore: 0,
					rPlayerNickname: (await this.usersService.getUserInfo(playerRight.id)).nick,
					rPlayerAvatarUrl: await this.usersService.getAvatarUrl(playerRight.id),
					rPlayerScore: 0,
					viewNumber: 0,
					type: game_type,
					map: map_type,
				}
				this.socket_infos[playerLeft.socket.id].match = userInfo;
				this.socket_infos[playerRight.socket.id].match = this.socket_infos[playerLeft.socket.id].match;
	
				this.server.to(room_id).emit("init", gameLogic.getInitJson(), userInfo);
	
				playerLeft.socket.emit('setMatchInfo', userInfo );
				playerRight.socket.emit('setMatchInfo', userInfo );
				playerLeft.socket.on('keyEvent', (e) => this.BarMovementEventListner(e, gameLogic, 'l'));
				playerRight.socket.on('keyEvent', (e) => this.BarMovementEventListner(e, gameLogic, 'r'));
	
				/*
				 * @brief 기권 버튼 클릭시 결과 전송 후 게임 종료
				*/
				
				playerLeft.socket.on("giveUp", () => this.GiveUpEventListener(playerLeft, playerRight, gameLogic, 'l', userInfo));
				playerRight.socket.on("giveUp", () => this.GiveUpEventListener(playerLeft, playerRight, gameLogic, 'r', userInfo));
	
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
				playerLeft.socket.on("disconnect", () => this.disconnectEvent(playerLeft, playerRight, gameLogic, 'l', userInfo));
				playerRight.socket.on("disconnect", () => this.disconnectEvent(playerLeft, playerRight, gameLogic, 'r', userInfo));
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
			//console.log("Spectate |", body.nick);
			const target_info = await this.usersService.getUserInfoWithNick(body.nick);
			const socket_info = this.getSocketInfo(target_info.user_id);

			// 1-1. 내 소켓 정보 저장 (rid: 나갈때 방이름 필요, match: 나갈 때 관전자 수 감소)
			this.socket_infos[socket.id] = {
				socket: socket, 
				sid: null, 
				uid: null, 
				rid: socket_info.rid, 
				match: socket_info.match, 
				logic: null,
				status: 'spectate',
			};

			// 1-2. 관전자 수 갱신
			this.socket_infos[socket.id].match.viewNumber += 1;
	
			// 2. 초기화
			//console.log('관전하기 |', socket_info.logic.getInitJson(), socket_info.match);
			socket.emit("init", socket_info.logic.getInitJson(), socket_info.match);
			socket.emit("setMatchInfo", socket_info.match);
			
			// 3. 같은 소켓 room에 접속시키기 (게임 인터벌에서 해당 룸으로 메세지를 쏴준다)
			socket.join(socket_info.rid);
			this.server.to(socket_info.rid).emit('setMatchInfo', socket_info.match);
		} catch (err) {
			socket.emit("invalidMatch");
			//console.log(err);
			return (err);
		}
	}

	async rejectGame(user_id: string) {
		const target_socket = this.getSocketInfo(user_id);
		this.server.to(target_socket.socket.id).emit('rejected');
	}

	afterInit(server: Server): any {
		//console.log('Game Socket Server Init');
	}

	async handleConnection(@ConnectedSocket() socket: Socket) {
		try {
			const sid = getSessionIDFromCookie(socket.request.headers.cookie);
			const user_id = await this.sessionService.readUserId(sid);
			//console.log('Game 웹소켓 연결됨', user_id);
		} catch (err) {
			console.error(err);
		}
	}

	async handleDisconnect(@ConnectedSocket() socket: Socket) {
		try {
			const socket_info = this.socket_infos[socket.id];
			if (socket_info) {
				const user_id = socket_info.uid;
		
				//console.log('Game 웹소켓 연결해제', user_id);
				// 1. 대기열에 있다면 대기열에서 제
				this.deleteFromNormalQueue(user_id);
				this.deleteFromLadderQueue(user_id);
				this.deleteFromInviteQueue(user_id);
	
				// 2. 관전자 처리 (관전자 수 수정해서 보냄)
				if (socket_info.status == 'spectate') {
					socket_info.match.viewNumber -= 1;
					this.server.to(socket_info.rid).emit('setMatchInfo', socket_info.match);
				}
	
				// 3. socket_info에서 제거
				socket.leave(socket_info.rid);
				if (socket_info.status != 'ingame')
					delete this.socket_infos[socket.id];
				this.usersService.updateStatus(user_id, 'online');
			}
		} catch (err) {
			console.error(err);
		}
	}
}