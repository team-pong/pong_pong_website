import { Connection } from "typeorm";
import { Factory, Seeder } from "typeorm-seeding";
import { Ban } from "../../entities/ban";
import { Users } from "../../entities/users";
import { Chat } from "../../entities/chat";
import { Admin } from "../../entities/admin";
import { ChatUsers } from "../../entities/chat-users";
import { DmStore } from "../../entities/dm-store";
import { Friend } from "../../entities/friend";
import { Match } from "../../entities/match";
import { Mute } from "../../entities/mute";
import { Block } from "../../entities/block";
import { Questions } from "../../entities/questions";

export class createInitialData implements Seeder {
	public async run(factory: Factory, connection: Connection): Promise<any>{
		
		await connection.query(`GRANT ALL PRIVILEGES ON TABLE session TO pong_session_admin`);
		await connection.query(`GRANT ALL PRIVILEGES ON TABLE session TO pong_admin`);
		await connection.query(`CREATE INDEX IDX_session_expire ON session (expire)`);

		await connection
			.createQueryBuilder().insert().into(Admin)
			.values([{user_id: 'jinbkim', channel_id: 1}, {user_id: 'donglee', channel_id: 1}, {user_id: 'hna', channel_id: 2}])
			.execute();
		await connection
			.createQueryBuilder().insert().into(Ban)
			.values([{user_id: 'jinbkim', channel_id: 2}, {user_id: 'donglee', channel_id: 2}, {user_id: 'hna', channel_id: 3}])
			.execute();
		await connection
			.createQueryBuilder().insert().into(Block)
			.values([{user_id: 'jinbkim', block_id: 'hna'}, {user_id: 'donglee', block_id: 'yochoi'}, {user_id: 'jinbkim', block_id: 'jinwkim'}])
			.execute();
		await connection
			.createQueryBuilder().insert().into(ChatUsers)
			.values([{user_id: 'jinbkim', channel_id: 1}, {user_id: 'donglee', channel_id: 1}, {user_id: 'hna', channel_id: 2}, {user_id: 'yochoi', channel_id: 1}, {user_id: 'jinwkim', channel_id: 2}, {user_id: 'hjung', channel_id: 3}])
			.execute();			
		await connection
			.createQueryBuilder().insert().into(Chat)
			.values([{owner_id: 'yochoi', title: '아무나', type: 'public', passwd: '', max_people: 10}, {owner_id: 'jinwkim', title: '아무나 와보렴', type: 'protected', passwd: '1234', max_people: 5}, {owner_id: 'hjung', title: '심심하니깐', type: 'private', passwd: '', max_people: 3}])
			.execute();
		await connection
			.createQueryBuilder().insert().into(DmStore)
			.values([{sender_id: 'jinbkim', receiver_id: 'donglee', content: '안녕'}, 
							{sender_id: 'donglee', receiver_id: 'jinbkim', content: '나도 안녕'}, 
							{sender_id: 'jinbkim', receiver_id: 'yochoi', content: '하이하이'},
							{sender_id: 'hna', receiver_id: 'jinbkim', content: 'hi'},
							{sender_id: 'jinwkim', receiver_id: 'hna', content: 'good'},
							{sender_id: 'yochoi', receiver_id: 'hna', content: 'ㅎㅇ'},
							{sender_id: 'hna', receiver_id: 'yochoi', content: 'ㅎㅇㅎㅇ'},
							{sender_id: 'hna', receiver_id: 'yochoi', content: '핑퐁ㄱㄱ'},
							{sender_id: 'yochoi', receiver_id: 'hna', content: 'ㄴㄴ'},
							{sender_id: 'jinwkim', receiver_id: 'yochoi', content: '123123'},
							{sender_id: 'jinbkim', receiver_id: 'yochoi', content: 'aa'},
							{sender_id: 'yochoi', receiver_id: 'donglee', content: '핑퐁ㄱㄱ'},
							{sender_id: 'tester01', receiver_id: 'yochoi', content: '오늘 날씨는?'},
							{sender_id: 'tester02', receiver_id: 'tester01', content: '테스트 01'},
							{sender_id: 'tester02', receiver_id: 'tester01', content: '테스트 02'},
							{sender_id: 'tester01', receiver_id: 'tester02', content: '테스트 03'},
							{sender_id: 'yochoi', receiver_id: 'tester02', content: '화요일'},
						])
			.execute();
		await connection
			.createQueryBuilder().insert().into(Friend)
			.values([{user_id: 'jinbkim', friend_id: 'donglee'}, {user_id: 'donglee', friend_id: 'jinbkim'}, {user_id: 'jinbkim', friend_id: 'yochoi'}])
			.execute();
		await connection
			.createQueryBuilder().insert().into(Match)
			.values([
				{winner_id: 'jinbkim', loser_id: 'donglee', winner_score: 3, loser_score: 1, type: 'general', map: 1}, {winner_id: 'donglee', loser_id: 'yochoi', winner_score: 3, loser_score: 2, type: 'ranked', map: 2}, {winner_id: 'donglee', loser_id: 'jinbkim', winner_score: 2, loser_score: 0, type: 'general', map: 3},
				{winner_id: 'jinbkim', loser_id: 'donglee', winner_score: 3, loser_score: 1, type: 'general', map: 2}, {winner_id: 'donglee', loser_id: 'yochoi', winner_score: 3, loser_score: 2, type: 'ranked', map: 2}, {winner_id: 'donglee', loser_id: 'jinbkim', winner_score: 2, loser_score: 0, type: 'general', map: 3},
				{winner_id: 'jinbkim', loser_id: 'donglee', winner_score: 3, loser_score: 1, type: 'general', map: 3}, {winner_id: 'donglee', loser_id: 'yochoi', winner_score: 3, loser_score: 2, type: 'ranked', map: 2}, {winner_id: 'donglee', loser_id: 'jinbkim', winner_score: 2, loser_score: 0, type: 'general', map: 3},
				{winner_id: 'jinbkim', loser_id: 'donglee', winner_score: 3, loser_score: 1, type: 'general', map: 1}, {winner_id: 'donglee', loser_id: 'yochoi', winner_score: 3, loser_score: 2, type: 'ranked', map: 2}, {winner_id: 'donglee', loser_id: 'jinbkim', winner_score: 2, loser_score: 0, type: 'general', map: 3},
				{winner_id: 'jinbkim', loser_id: 'donglee', winner_score: 3, loser_score: 1, type: 'general', map: 2}, {winner_id: 'donglee', loser_id: 'yochoi', winner_score: 3, loser_score: 2, type: 'ranked', map: 2}, {winner_id: 'donglee', loser_id: 'jinbkim', winner_score: 2, loser_score: 0, type: 'general', map: 3},
				{winner_id: 'jinbkim', loser_id: 'donglee', winner_score: 3, loser_score: 1, type: 'general', map: 3}, {winner_id: 'donglee', loser_id: 'yochoi', winner_score: 3, loser_score: 2, type: 'ranked', map: 2}, {winner_id: 'donglee', loser_id: 'jinbkim', winner_score: 2, loser_score: 0, type: 'general', map: 3},
				{winner_id: 'jinbkim', loser_id: 'donglee', winner_score: 3, loser_score: 1, type: 'general', map: 1}, {winner_id: 'donglee', loser_id: 'yochoi', winner_score: 3, loser_score: 2, type: 'ranked', map: 2}, {winner_id: 'donglee', loser_id: 'jinbkim', winner_score: 2, loser_score: 0, type: 'general', map: 3},
				{winner_id: 'jinbkim', loser_id: 'donglee', winner_score: 3, loser_score: 1, type: 'general', map: 2}, {winner_id: 'donglee', loser_id: 'yochoi', winner_score: 3, loser_score: 2, type: 'ranked', map: 2}, {winner_id: 'donglee', loser_id: 'jinbkim', winner_score: 2, loser_score: 0, type: 'general', map: 3},
				{winner_id: 'jinbkim', loser_id: 'donglee', winner_score: 3, loser_score: 1, type: 'general', map: 3}, {winner_id: 'donglee', loser_id: 'yochoi', winner_score: 3, loser_score: 2, type: 'ranked', map: 2}, {winner_id: 'donglee', loser_id: 'jinbkim', winner_score: 2, loser_score: 0, type: 'general', map: 3},
				{winner_id: 'jinbkim', loser_id: 'donglee', winner_score: 3, loser_score: 1, type: 'general', map: 3}, {winner_id: 'donglee', loser_id: 'yochoi', winner_score: 3, loser_score: 2, type: 'ranked', map: 2}, {winner_id: 'donglee', loser_id: 'jinbkim', winner_score: 2, loser_score: 0, type: 'general', map: 3},
			])
			.execute();
		await connection
			.createQueryBuilder().insert().into(Mute)
			.values([{channel_id: 2, user_id: 'jinbkim'}, {channel_id: 3, user_id: 'jinbkim'}, {channel_id: 1, user_id: 'hjung'}])
			.execute();
		await connection
			.createQueryBuilder().insert().into(Users)
			.values([
				{user_id: 'jinbkim', nick: 'jinbkim', avatar_url: 'https://gravatar.com/avatar/d93441b99017237ec67159e63c4f991?s=400&d=robohash&r=x', total_games:20, win_games:10, loss_games:10}, 
				{user_id: 'donglee', nick: 'donglee', avatar_url: 'https://gravatar.com/avatar/d93441b990172e7ec67159e63c4f992?s=400&d=robohash&r=x', total_games:30, win_games:20, loss_games:10, ladder_level:1500}, 
				{user_id: 'jinwkim', nick: 'jinwkim', avatar_url: 'https://gravatar.com/avatar/d93441b991723e7ec67159e63c4f995?s=400&d=robohash&r=x'}, 
				{user_id: 'hjung', nick: 'hjung', avatar_url: 'https://gravatar.com/avatar/d93441b990173e7ec67159e63c4f996?s=400&d=robohash&r=x'},
				{user_id: 'yochoi', nick: 'yochoi', avatar_url: 'https://gravatar.com/avatar/d93441b990173e7ec67159e63c4f916?s=400&d=robohash&r=x'},
				{user_id: 'hna', nick: 'hna', avatar_url: 'https://gravatar.com/avatar/d93441b990173e7ec67159e63c4f926?s=400&d=robohash&r=x'},
				{user_id: 'juhlee', nick: 'juhlee', avatar_url: 'https://gravatar.com/avatar/d93441b991723e7ec67159e63c4f997?s=400&d=robohash&r=x'},
				{user_id: 'hyeonkim', nick: 'hyeonkim', avatar_url: 'https://gravatar.com/avatar/d9341b9901723e7ec67159e63c4f998?s=400&d=robohash&r=x'},
				{user_id: 'unknown', nick: 'unknown', avatar_url: 'https://gravatar.com/avatar/d9344b9901723e7ec67159e63c4f999?s=400&d=robohash&r=x'},
				{user_id: 'tester01', nick: 'tester01', avatar_url: 'https://gravatar.com/avatar/d9344b9901723e7ec67159e63c4f199?s=400&d=robohash&r=x', admin: true},
				{user_id: 'tester02', nick: 'tester02', avatar_url: 'https://gravatar.com/avatar/d9344b9901723e7ec67159e63c4f299?s=400&d=robohash&r=x'},
				{user_id: 'tester03', nick: 'tester03', avatar_url: 'https://gravatar.com/avatar/d9341b9901723e7ec67159e63c4f918?s=400&d=robohash&r=x'},
				{user_id: 'tester04', nick: 'tester04', avatar_url: 'https://gravatar.com/avatar/d9341b9901723e7ec67159e63c4f928?s=400&d=robohash&r=x'},
			])
			.execute();
			await connection
			.createQueryBuilder().insert().into(Questions)
			.values([
				{user_id: "jinbkim", title: "운영자님 이것좀 보소", email: "jinbkim@naver.com", content: "버그가 개쩌네", answer: "버그 못고치겠어"},
				{user_id: "donglee", title: "문의 사항있음", email: "donglee@naver.com", content: "너무 재밌어", answer: ""},
			])
			.execute();
	}
}