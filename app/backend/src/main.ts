import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Client } from 'pg';
import { SocketAdapter } from './adapter';

/*
 * 세션에 추가적으로 저장할 property들 
 * (세션 - 유저id - token값(42api)) 
 * login이 되었는지 여부
 */
declare module 'express-session' {
  export interface SessionData {
    userid: string,
    token: string,
    loggedIn: boolean,
  }
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 웹소켓 서버 띄우기
	app.useWebSocketAdapter(new SocketAdapter(app));

  /*
  const config = new DocumentBuilder()
  .setTitle('ft_transcendence API')
  .setDescription('ft_transcendence API 문서')
  .setVersion('1.0')
  .addCookieAuth('connect.sid')
  .build();
  const document = SwaggerModule.createDocument(app, config);
  // 스웨거 설정
  SwaggerModule.setup('api', app, document);
  */

  const conObject = {
    user: 'pong_admin',
    host: process.env.PG_HOST,
    database: process.env.PG_PONG_DB,
    password: '1234',
    port: +process.env.PG_PORT,
  };

  const pgSession = require('connect-pg-simple')(session);

  const pgStoreConfig = {
    conString: `postgres://${conObject.user}:${conObject.password}@${conObject.host}:${conObject.port}/${conObject.database}`,
  };

  // CORS 문제 해결
  app.enableCors({
  	origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  // 세션을 DB에 저장
  app.use(
    session({
      store: new pgSession(pgStoreConfig),
      secret: 'pong-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 60 * 1000 * 360, sameSite: "strict", httpOnly: true} // 
    }),
  );

  // req.cookies로 쿠키를 파싱해온다
  app.use(cookieParser());

  // 유저 입력 Form 검증
  app.useGlobalPipes(
    // whiteList -> 엔티티 데코레이터에 없는 프로퍼티 값은 무조건 거름
    // forbidNonWhitelisted -> 엔티티 데코레이터에 없는 값 인입시 그 값에 대한 에러메세지 알려줌
    // transform -> 컨트롤러가 값을 받을때 컨트롤러에 정의한 타입으로 형변환
    new ValidationPipe({
      whitelist: false,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  await app.listen(3001);
}
bootstrap();