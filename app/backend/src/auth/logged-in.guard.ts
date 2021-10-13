import { ExecutionContext, Injectable, CanActivate } from "@nestjs/common";
import { Observable } from "rxjs";
import { Socket } from "socket.io";
import { GlobalService } from "src/global/global.service";
import { UsersService } from "src/users/users.service";
import { UsersRepo}

/*!
 * @brief return 결과가 true냐 false냐 에 따라서 다음 컨트롤러를 쓸 수 있냐 없냐가 정해진다.
 * 	      true 면 로그인 한 사용자들만 사용 가능
 */
@Injectable()
export class LoggedInGuard implements CanActivate {
	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const req = context.switchToHttp().getRequest();
		if (req.session.userid)
			return true;
		return false;
	}
}

/*!
 * @brief return 결과가 true냐 false냐 에 따라서 다음 컨트롤러를 쓸 수 있냐 없냐가 정해진다.
 * 	      true 면 로그인 한 사용자들만 사용 가능
 */
@Injectable()
export class LoggedInWsGuard implements CanActivate {
	private globalService: GlobalService = new GlobalService();
	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const req = context.switchToWs().getClient<Socket>();
		const cookie = req.request.headers.cookie;
		if (cookie) {
			const session_id = this.globalService.getSessionIDFromCookie(cookie);
			const user_id = this.globalService.getUserIdFromSessionId(session_id);
			if (user_id) {
				console.log('ws login ok', user_id);
				return true;
			} else {
				console.log('no user_id');
			}
		}
		return false;
	}
}