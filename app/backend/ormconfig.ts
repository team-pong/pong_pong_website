import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { ChatUsers } from './src/entities/chat-users';
import { DmStore } from './src/entities/dm-store';
import { Achievements } from './src/entities/achievements'
import { Admin } from './src/entities/admin'
import { Ban } from './src/entities/ban'
import { Chat } from './src/entities/chat'
import { Friend } from './src/entities/friend'
import { Match } from './src/entities/match'
import { Mute } from './src/entities/mute'
import { session } from './src/entities/session'
import { Users } from './src/entities/users'
import { Block } from './src/entities/block';
import { AuthCode } from './src/entities/auth-code';
import { Questions } from './src/entities/questions';

dotenv.config();
const config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'db',
  port: 5432,
  username: process.env.PG_PONG_ADMIN,
  password: process.env.PG_PONG_PW,
  database: process.env.PG_PONG_DB,
  entities: [
    Achievements,
    Admin,
    Ban,
    Chat,
    ChatUsers,
    DmStore,
    Friend,
    Match,
    Mute,
    session,
    Users,
    Block,
    AuthCode,
    Questions
  ],
  migrations: [__dirname + '/src/migrations/*.ts'],
  cli: { migrationsDir: 'src/migrations' },
  autoLoadEntities: true,
  synchronize: false,
  logging: false,
  keepConnectionAlive: true,
};

export = config;