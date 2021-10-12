import { Injectable } from '@nestjs/common';

@Injectable()
export class GlobalService {
  constructor() {}

  getSessionIDFromCookie(cookie): string {
    if (cookie) {
      return cookie.split('.')[1].substring(8);
    } else {
      console.log('no cookie');
      return ;
    }
  }
}