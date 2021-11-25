import { ExecutionContext, Injectable, CanActivate, ConsoleLogger } from "@nestjs/common";
import { Observable } from "rxjs";
import { Socket } from "socket.io";
import axios from "axios";

/*!
 * @brief return 결과가 true냐 false냐 에 따라서 다음 컨트롤러를 쓸 수 있냐 없냐가 정해진다.
 * 	      true 면 로그인 한 사용자들만 사용 가능
 */
@Injectable()
export class LoggedInWsGuard implements CanActivate {
	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		try{

			const req = context.switchToWs().getClient<Socket>();
			const cookie = req.request.headers.cookie;
			//console.log('로그인 체크중');
			if (cookie) {
				//console.log('쿠키 확인');
				const session_id = cookie.split('.')[1].substring(8);
				axios.get(`${process.env.BACKEND_SERVER_URL}/session/user_id?sid=${session_id}`).then((val) => {
					//console.log('axios 요청 완료: ', val);
					if (val) {
						//console.log('유저 아이디 확인');
						return true;
					}
				}).catch((err) => {return false;});
			}
			//console.log('return false');
			return false;
		} catch (err) {
			//console.log('에러발생', err);
			return false;
		}
	}
}