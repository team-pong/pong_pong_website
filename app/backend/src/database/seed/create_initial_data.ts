import { Connection } from "typeorm";
import { Factory, Seeder } from "typeorm-seeding";

export class createInitialData implements Seeder {
	public async run(factory: Factory, connection: Connection): Promise<any>{
	}
}