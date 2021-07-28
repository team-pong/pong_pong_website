import { Ban } from "../../entities/ban";
import { Users } from "../../entities/users";
import { Chat } from "../../entities/chat";

import { Connection } from "typeorm";
import { Factory, Seeder } from "typeorm-seeding";

export class createInitialData implements Seeder {
	public async run(factory: Factory, connection: Connection): Promise<any>{
		
		await connection.query(`GRANT ALL PRIVILEGES ON TABLE session TO pong_session_admin`);
		await connection.query(`GRANT ALL PRIVILEGES ON TABLE session TO pong_admin`);
		// await connection.query(`ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE`);
		await connection.query(`CREATE INDEX IDX_session_expire ON session (expire)`);

		await connection
			.createQueryBuilder().insert().into(Users)
			.values([{user_id: 'jinbkim', nick: 'jinbkim', avatar_url: 'a'}, {user_id: 'donglee', nick: 'donglee', avatar_url: 'b'}, {user_id: 'hna', nick: 'hna', avatar_url: 'c'}])
			.execute();
		await connection
			.createQueryBuilder().insert().into(Chat)
			.values([{title: '아무나', owner_id: 'jinbkim', type: 'public', passwd: ''}, {title: '놀사람', owner_id: 'donglee', type: 'private', passwd: ''}, {title: '구함', owner_id: 'hna', type: 'proteced', passwd:'1234'}])
			.execute();
	}
}