import { Injectable } from '@nestjs/common';

@Injectable()
export class GlobalService {
  constructor() {}

  getSessionIDFromCookie(cookie): string {
    return cookie.split('.')[1].substring(8);
  }
}