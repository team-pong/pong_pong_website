import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import { Client } from 'pg';

declare module 'express-session' {
  export interface SessionData {
    userid: string,
    token: string,
  }
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const conObject = {
    user: 'pong_session_admin',
    host: process.env.PG_HOST,
    database: process.env.PG_PONG_DB,
    password: '1234',
    port: +process.env.PG_PORT,
  };

const pgSession = require('connect-pg-simple')(session);

const pgStoreConfig = {
  conString: `postgres://${conObject.user}:${conObject.password}@${conObject.host}:${conObject.port}/${conObject.database}`,
};

  app.enableCors({
    "origin": ["http://localhost:3000", "http://127.0.0.1:3000"],
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204,
    "credentials": true,
  });

  app.use(
    session({
      store: new pgSession(pgStoreConfig),
      secret: 'pong-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 60 * 1000, sameSite: "strict", httpOnly: true}
    }),
  );

  app.use(cookieParser());

  await app.listen(3001);
}
bootstrap();