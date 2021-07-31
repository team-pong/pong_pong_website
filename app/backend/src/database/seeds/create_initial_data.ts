import { Connection } from "typeorm";
import { Factory, Seeder } from "typeorm-seeding";
import { Ban } from "../../entities/ban";
import { Users } from "../../entities/users";
import { Chat } from "../../entities/chat";
import { Achievements } from "../../entities/achievements";
import { Admin } from "../../entities/admin";
import { ChatUsers } from "../../entities/chat-users";
import { DmStore } from "../../entities/dm-store";
import { Friend } from "../../entities/friend";
import { Match } from "../../entities/match";
import { Mute } from "../../entities/mute";

export class createInitialData implements Seeder {
	public async run(factory: Factory, connection: Connection): Promise<any>{
		
		await connection.query(`GRANT ALL PRIVILEGES ON TABLE session TO pong_session_admin`);
		await connection.query(`GRANT ALL PRIVILEGES ON TABLE session TO pong_admin`);
		await connection.query(`CREATE INDEX IDX_session_expire ON session (expire)`);

		await connection
			.createQueryBuilder().insert().into(Achievements)
			.values([{user_id: 'jinbkim', achievement: '난무조건이겨'}, {user_id: 'jinbkim', achievement: '나는야입문자'}, {user_id: 'donglee', achievement: '타락파워전사'}])
			.execute();
		await connection
			.createQueryBuilder().insert().into(Admin)
			.values([{user_id: 'jinbkim', channel_id: 1}, {user_id: 'donglee', channel_id: 1}, {user_id: 'hna', channel_id: 2}])
			.execute();
		await connection
			.createQueryBuilder().insert().into(Ban)
			.values([{user_id: 'jinbkim', channel_id: 2}, {user_id: 'donglee', channel_id: 2}, {user_id: 'hna', channel_id: 3}])
			.execute();
		await connection
			.createQueryBuilder().insert().into(ChatUsers)
			.values([{user_id: 'jinbkim', channel_id: 1}, {user_id: 'donglee', channel_id: 1}, {user_id: 'hna', channel_id: 2}, {user_id: 'yochoi', channel_id: 1}, {user_id: 'jinwkim', channel_id: 2}, {user_id: 'hjung', channel_id: 3}])
			.execute();
		await connection
			.createQueryBuilder().insert().into(Chat)
			.values([{owner_id: 'yochoi', title: '아무나', type: 'public', passwd: '', max_people: 10}, {owner_id: 'jinwkim', title: '아무나 와보렴', type: 'protected', passwd: '1234', max_people: 5}, {owner_id: 'hjing', title: '심심하니깐', type: 'private', passwd: '', max_people: 3}])
			.execute();
		await connection
			.createQueryBuilder().insert().into(DmStore)
			.values([{sender_id: 'jinbkim', receiver_id: 'donglee', content: '안녕'}, {sender_id: 'donglee', receiver_id: 'jinbkim', content: '나도 안녕'}, {sender_id: 'jinbkim', receiver_id: 'yochoi', content: '하이하이'}])
			.execute();
		await connection
			.createQueryBuilder().insert().into(Friend)
			.values([{user_id: 'jinbkim', friend_id: 'donglee'}, {user_id: 'donglee', friend_id: 'jinbkim'}, {user_id: 'jinbkim', friend_id: 'yochoi'}])
			.execute();
		await connection
			.createQueryBuilder().insert().into(Match)
			.values([{winner_id: 'jinbkim', loser_id: 'donglee', winner_score: 3, loser_score: 1, type: 'general', map: 1}, {winner_id: 'donglee', loser_id: 'yochoi', winner_score: 3, loser_score: 2, type: 'ranked', map: 2}, {winner_id: 'donglee', loser_id: 'jinbkim', winner_score: 2, loser_score: 0, type: 'general', map: 3}])
			.execute();
		await connection
			.createQueryBuilder().insert().into(Mute)
			.values([{channel_id: 2, user_id: 'jinbkim'}, {channel_id: 3, user_id: 'jinbkim'}, {channel_id: 1, user_id: 'hjung'}])
			.execute();
		await connection
			.createQueryBuilder().insert().into(Users)
			.values([
				{user_id: 'jinbkim', nick: 'jinbkim', avatar_url: 'a'}, 
				{user_id: 'donglee', nick: 'donglee', avatar_url: 'b'}, 
				{user_id: 'hna', nick: 'hna', avatar_url: 'c'}, 
				{user_id: 'yochoi', nick: 'yochoi', avatar_url: 'd'}, 
				{user_id: 'jinwkim', nick: 'jinwkim', avatar_url: 'e'}, 
				{user_id: 'hjung', nick: 'hjung', avatar_url: 'f'},
				{user_id: 'juhlee', nick: 'juhlee', avatar_url: 'g'},
				{user_id: 'hyeonkim', nick: 'hyeonkim', avatar_url: 'h'},
			])
			.execute();
	}
}