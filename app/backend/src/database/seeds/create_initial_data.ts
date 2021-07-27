import { Ban } from "../../entities/ban";
import { Users } from "../../entities/users";
import { Connection } from "typeorm";
import { Factory, Seeder } from "typeorm-seeding";

export class createInitialData implements Seeder {
	public async run(factory: Factory, connection: Connection): Promise<any>{
		
		await connection.query(`GRANT ALL PRIVILEGES ON TABLE session TO pong_session_admin`);
		await connection.query(`GRANT ALL PRIVILEGES ON TABLE session TO pong_admin`);
		// await connection.query(`ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE`);
		await connection.query(`CREATE INDEX IDX_session_expire ON session (expire)`);


		// await connection
		// 	.createQueryBuilder().insert().into(Users)
		// 	.values([{nick: 'jinbkim', avatar_url: 'a'}, {nick: 'hjung', avatar_url: 'b'}])
		// 	.execute();
		// await connection
		// 	.createQueryBuilder().insert().into(Ban)
		// 	.values([{channel_id: 1, user_id: 2}])
		// 	.execute();

	}
}