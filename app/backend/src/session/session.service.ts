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
import { SessionDto1 } from 'src/dto/session';
import { err25 } from 'src/err';
import { ErrMsgDto } from 'src/dto/utility';

const db = {
	user: process.env.PG_PONG_ADMIN,
	host: process.env.PG_HOST,
	database: process.env.PG_PONG_DB,
	password: process.env.PG_PONG_PW,
	port: +process.env.PG_PORT,
};

const qs = require('querystring');
const client = new Client(db);

@Injectable()
export class SessionService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(session) private sessionRepo: Repository<session>,

    ){}

  async getToken(loginCodeDto: LoginCodeDto) {
    const { code } = loginCodeDto;
    const type = "authorization_code";
    const getTokenUrl = "https://api.intra.42.fr/oauth/token";
    const redirectUrl = "http://127.0.0.1:3000/mainpage"
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

  async getInfo(access_token: string) {
    const getUserUrl = "https://api.intra.42.fr/v2/me";
    return axios.get(getUserUrl, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
  }

/*!
 * @author hna
 * @brief id와 토큰값을 Session 객체의 속성에 추가하고 Postgres의 session 테이블에 저장.
 * @warning 세션 객체에 새로운 값을 추가하는 경우 main.ts 에서 SessionData 인터페이스에 먼저 추가해야함
 */
async saveSession(session: Session & Partial<SessionData>, id: string, token: string) {
  session.userid = id;
  session.token = token;
  session.save();
}


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
      const { data } = await this.getInfo(access_token)
      // await this.saveInfo(data.login, data.image_url)
      await this.usersService.createUsers(data.login, data.login, data.image_url);

      // console.log('req.session : ', req.session);
      // console.log('data.login : ', data.login);
      // console.log('access_token : ', access_token);


      await this.saveSession(req.session, data.login, access_token);
    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err)) {
        console.log("42api error:", err.response.statusText);
        res.statusCode = err.response.status;
        res.statusMessage = err.response.statusText;
        res.json(err.response.data);
      }
      else {
        console.log("login error:", err);
      }
    }
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
      console.log("valid check error:", err);
    }
  }

  // 세션 아이디로 유저아이디 검색
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
}