import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SessionService } from 'src/session/session.service';

@Injectable()
export class GlobalService {
  constructor(
    private sessionService: SessionService,
  ) {}

  getSessionIDFromCookie(cookie): string {
    if (cookie) {
      return cookie.split('.')[1].substring(8);
    } else {
      throw 'empty cookie';
    }
  }
  
  getUserIdFromSessionId(session_id: string) {
    return this.sessionService.readUserId(session_id);
  }
}