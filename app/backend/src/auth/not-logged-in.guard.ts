import { ExecutionContext, Injectable, CanActivate, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";

/*!
 * @brief return 결과가 true냐 false냐 에 따라서 다음 컨트롤러를 쓸 수 있냐 없냐가 정해진다.
 * 	      true 면 로그인 안한 사용자들만 사용 가능 (ex. 로그인 기능은 로그인 하지 않은 유저만 사용 가능)
 */
@Injectable()
export class NotLoggedInGuard implements CanActivate {
	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const req = context.switchToHttp().getRequest();
		if (req.session.userid)
			return false;
		return true;
	}
}