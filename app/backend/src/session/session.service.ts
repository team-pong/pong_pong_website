import { Injectable } from '@nestjs/common';
import { LoginCodeDto } from 'src/dto/login-token-dto';
import axios, { AxiosError } from 'axios';
import { Session, SessionData } from 'express-session';
import { Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { Client } from 'pg';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { session } from 'src/entities/session';
import { err25 } from 'src/err';
import { SessionDto1 } from 'src/dto/session';
import { Users } from 'src/entities/users';
import * as nodemailer from 'nodemailer';
import { AuthCode } from 'src/entities/auth-code';
import { transportOption } from 'src/mail/mailer.option';
import { ErrMsgDto } from 'src/dto/utility';
import * as qs from 'querystring';

const db = {
	user: process.env.PG_PONG_ADMIN,
	host: process.env.PG_HOST,
	database: process.env.PG_PONG_DB,
	password: process.env.PG_PONG_PW,
	port: +process.env.PG_PORT,
};

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(session) private sessionRepo: Repository<session>,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
    @InjectRepository(AuthCode) private authCodeRepo: Repository<AuthCode>,
    ){}

	/*!
	 * @brief 테스트 유저용 로그인 함수 (42api를 거치지 않음)
	 * @detail 게임 매칭이 2인이라서 혼자 테스트하려면 2개 계정이 있어야해서 만듬
	 * @todo production 환경에서 삭제되어야함
	 */
	public async tester_login(req: Request, user_id: string, nickname: string, avatar_url: string) {
		try {
      if (true) { // 중복 로그인을 시도하는 경우
        const sessions = await this.sessionRepo.query("SELECT * FROM session;"); // return list
        for (let session of sessions) {
          let parsed_id = JSON.parse(session.sess).userid;
          if (parsed_id == user_id) {
            this.sessionRepo.delete({sid: session.sid});
          }
        }
      }
      req.session.userid = user_id;
      req.session.token = 'test_token';
      req.session.loggedIn = true;
      req.session.save();
		} catch (err) {
			//console.log('tester user login error:', err);
		}
	}

  async getToken(loginCodeDto: LoginCodeDto) {
    const { code } = loginCodeDto;
    const type = "authorization_code";
    const getTokenUrl = "https://api.intra.42.fr/oauth/token";
    const redirectUrl = `${process.env.BACKEND_SERVER_URL}/session/oauth`;
    const requestBody = {
      grant_type: type,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: code,
      redirect_uri: redirectUrl
    };
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    return axios.post(getTokenUrl, qs.stringify(requestBody), config);
  }

  async getUserInfoFrom42Api(access_token: string) {
    const getUserUrl = "https://api.intra.42.fr/v2/me";
    return axios.get(getUserUrl, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
  }

  // async isDuplicatedLogin(user_id: string) {
  //   await this.sessionRepo.find()
  // }

  /*!
   * @author hna
   * @param[in] loginCodeDto Body로 들어온 code
   * @param[in] req Request 객체
   * @param[in] res Response 객체
   * @brief 유저 로그인시 세션 생성
   * @detail 1. LoginCode를 받아 42api에서 토큰발급
   * @       2. 토큰으로 유저 정보 조회
   * @       3. 유저 id와 avatar_url을 DB에 저장
   * @       4. 세션을 저장하고 응답 쿠키에 세션 아이디를 기록
   * @todo 함수 정리
   */
  public async login(loginCodeDto: LoginCodeDto, req: Request, res: Response) {
    try {
      const result = await this.getToken(loginCodeDto)
      const { access_token } = result.data;
      const { data } = await this.getUserInfoFrom42Api(access_token);
      const user = await this.usersRepo.findOne({user_id: data.login});
      if (true) { // 중복 로그인을 시도하는 경우 (일단 모든 로그인에 대해서 검사, status가 online인 유저만 검사해도 되나?)
        // 유저가 하나의 세션만 가질 수 있도록 기존 session 테이블에서 해당 유저의 session 제거
        const sessions = await this.sessionRepo.query("SELECT * FROM session;"); // return list
        for (let session of sessions) {
          let user_id = JSON.parse(session.sess).userid;
          if (data.login == user_id) {
            this.sessionRepo.delete({sid: session.sid});
          }
        }
      }
      if (!user) { // 회원가입이 필요한 경우
        await this.usersRepo.save({
          user_id: data.login, 
          nick: data.login, 
          avatar_url: data.image_url,
          two_factor_login: false, 
          email: data.email
        });
        req.session.userid = data.login;
        req.session.token = access_token;
        req.session.loggedIn = true;
        req.session.save();
        await this.usersRepo.update(data.login, {status: 'online'});
        return res.redirect(`${process.env.BACKEND_SERVER_URL}/mainpage?firstLogin=true`);
      }
      if (user.two_factor_login) { // 2차인증이 켜져 있는 경우
        const random_code = this.getRandomAuthCode(4);
        const transporter = nodemailer.createTransport(transportOption);
        const info = await transporter.sendMail({
          from: `"ft_trancendence team" <${process.env.EMAIL_ID}>`,
          to: user.email,
          subject: '2차 인증 코드 안내',
          html: `<b>${random_code}</b>`,
        });
        req.session.userid = data.login;
        req.session.token = access_token;
        req.session.loggedIn = false;
        req.session.save();
        await this.authCodeRepo.save({user_id: data.login, email_code: random_code});
        return res.redirect(`${process.env.BACKEND_SERVER_URL}?twoFactor=email`);
      } 
      req.session.userid = data.login;
      req.session.token = access_token;
      req.session.loggedIn = true;
      req.session.save();
      await this.usersRepo.update(data.login, {status: 'online'});
      return res.redirect(`${process.env.BACKEND_SERVER_URL}/mainpage`);
    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err)) { // 42 응답에러
        //console.log("42api error:", err.response.statusText);
        res.statusCode = err.response.status;
        res.statusMessage = err.response.statusText;
        res.json(err.response.data);
      }
      else { // 내부 에러
        //console.log("login error:", err);
      }
    }
  }

  getRandomAuthCode(n: number) {
    let ret = '';
    for (let i = 0; i < n; i++) {
      ret += String.fromCharCode(Math.floor(Math.random() * 25) + 97);
    }
    return ret;
  }

 /*!
  * @author hna
  * @param[in] sessionID 문자열 세션 아이디
  * @param[in] response 세션 검증 결과를 담아서 보낼 response 객체
  * @param[out] {response: "invalid"} | {response: "ok"}
  * @brief 입력받은 세션 ID와 토큰이 유효한지 체크해서 Body에 결과를 담는다
  * @detail 1. 세션ID는 DB의 session 테이블에 해당 sid가 있는지 확인한다.
  *         2. 토큰은 42api에 토큰정보 조회를 요청한다.
  */
  public async sessionValidCheck(sessionID: string, response: Response) {
    try {
      const client = new Client(db);
      await client.connect();
      const res = await client.query(`SELECT * FROM session WHERE sid='${sessionID}';`);
      if (res.rowCount == 0)
        response.json({ response: "invalid" });
      else {
        const token = res.rows[0].sess.token;
        const res2 = await axios.get('https://api.intra.42.fr/oauth/token/info', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res2.status == 200)
          response.json({ response: "ok" });
        else
          response.json({ response: "invalid" });
      }
      await client.end();
    } catch (err) {
      //console.log("valid check error:", err);
    }
  }

  // 세션 아이디로 유저아이디 검색 (문자열로 반환)
  async readUserId(sid: string){
    if (await this.sessionRepo.count({sid: sid}) === 0)  // 해당하는 세션 아이디가 없으면
      return err25;
    // 세션아이디에서 유저아이디를 뽑아내는 과정
    let sess = await this.sessionRepo.findOne({sid : sid});
    let process1 = sess.sess;
    let process2 = process1.split(",\"userid\":\"");
    let process3 = process2[1].split("\"");
    return process3[0];
  }

  // 세션 아이디로 유저아이디 검색 (json 형식으로 반환)
  async readUser(sid: string){
    let user_id = await this.readUserId(sid);  // 세션아이디에서 유저 아이디 읽음
    let user = new SessionDto1;
    user.user_id = user_id;
    return user;
  }

  async getMultiFactorAuthInfo(user_id: string) {
    const user_info = await this.usersRepo.findOne({user_id: user_id});
    if (user_info) {
      return {email: user_info.two_factor_login};
    }
  }

  async updateMultiFactorAuthInfo(user_id: string, two_factor_login: boolean) {
    await this.usersRepo.update({user_id: user_id}, {two_factor_login: two_factor_login});
  }

  // 해당 유저가 입력한 이메일 코드가 올바른지 확인 (2차 인증)
  async isValidCode(user_id: string, code: string) {
    const ret = await this.authCodeRepo.findOne({user_id: user_id, email_code: code});
    if (ret) {
      this.authCodeRepo.delete({user_id: user_id});
      return true;
    }
    return false;
  }

  // 해당 유저가 admin인지 확인 (문의 답변 보내기 api 권한 확인)
  async isAdmin(user_id: string) {
    const ret = await this.usersRepo.count({user_id: user_id, admin: true})
    if (ret) {
      return true;
    }
    return false;
  }

  async deleteSession(sid: string) {
    if (await this.sessionRepo.count({sid: sid}) === 0)  // 존재하지 않은 세션 아이디 이면
      return new ErrMsgDto(err25);
    await this.sessionRepo.delete({sid: sid});
  }
}