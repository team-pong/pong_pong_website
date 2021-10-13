import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SessionService } from 'src/session/session.service';

@Injectable()
export class GlobalService {
  constructor(
  ) {}

  @Inject(forwardRef(() => SessionService))
  private sessionService: SessionService

  getSessionIDFromCookie(cookie): string {
    if (cookie) {
      return cookie.split('.')[1].substring(8);
    } else {
      console.log('no cookie');
      return ;
    }
  }
  
  getUserIdFromSessionId(session_id: string) {
    return this.sessionService.readUserId(session_id);
  }
}