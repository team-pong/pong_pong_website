import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(
    session({
      secret: 'pong-secret',
      resave: false,
      saveUninitialized: false,
    }),
  );
  await app.listen(3001);
}
bootstrap();
