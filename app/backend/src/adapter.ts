import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

export class SocketAdapter extends IoAdapter {
  createIOServer(
    port: number,
    options?: ServerOptions & {
      namespace?: string;
      server?: any;
    },
  ) {
    const server = super.createIOServer(port, { ...options, cors: {
			origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
			methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
			preflightContinue: false,
			optionsSuccessStatus: 204,
			credentials: true,}
		});
    return server;
  }
}