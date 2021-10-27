import { forwardRef, Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Questions } from 'src/entities/questions';
import { SessionModule } from 'src/session/session.module';
import { Users } from 'src/entities/users';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Questions, Users]),
    forwardRef(() => SessionModule),
    forwardRef(() => UsersModule),
  ],
  providers: [QuestionsService],
  controllers: [QuestionsController],
  exports: [QuestionsService]
})
export class QuestionsModule {}
