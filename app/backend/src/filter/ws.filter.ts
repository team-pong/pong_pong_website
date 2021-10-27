import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

/*
 * 웹소켓 입력 검증시 필요한 필터
 * ws form 검사시 발생한 에러를 catch하고 클라이언트에 돌려주는 부분을 여기서 구현해야한다.
*/
@Catch(WsException, HttpException)
export class WsExceptionFilter {
  public catch(exception: HttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    this.handleError(client, exception);
  }

  public handleError(client: Socket, exception: HttpException | WsException) {
    if (exception instanceof HttpException) {
      // handle http exception
			console.error(exception.message);
			// client.emit("err", exception.getResponse());
			client._error(exception.getResponse());
    } else {
			// handle websocket exception
			console.error(exception.message);
			client._error(exception.getError());
    }
  }
}