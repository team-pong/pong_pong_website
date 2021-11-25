import { Injectable, Res } from '@nestjs/common';
import { LoginCodeDto } from './dto/login-token-dto';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { Client } from 'pg';
import { request, response, Request, Response } from 'express';
import { Session, SessionData } from 'express-session';
import { rejects } from 'assert';
const qs = require('querystring');

// const client = new Client({
// 	user: process.env.PG_PONG_ADMIN,
// 	host: process.env.PG_HOST,
// 	database: process.env.PG_PONG_DB,
// 	password: process.env.PG_PONG_PW,
// 	port: +process.env.PG_PORT,
// });
const db = {
	user: process.env.PG_PONG_ADMIN,
	host: process.env.PG_HOST,
	database: process.env.PG_PONG_DB,
	password: process.env.PG_PONG_PW,
	port: +process.env.PG_PORT,
};

const client = new Client(db);

@Injectable()
export class AppService {
  
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
      const result = await getToken(loginCodeDto)
      const { access_token } = result.data;
      const { data } = await getInfo(access_token)
      await saveInfo(data.login, data.image_url)
      await saveSession(req.session, data.login, access_token);
    } catch (err: any | AxiosError) {
      if (axios.isAxiosError(err)) {
        //console.log("42api error:", err.response.statusText);
        res.statusCode = err.response.status;
        res.statusMessage = err.response.statusText;
        res.json(err.response.data);
      }
      else {
        //console.log("login error:", err);
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
        response.json({response: "invalid"});
      else {
        const token = res.rows[0].sess.token;
        const res2 = await axios.get('https://api.intra.42.fr/oauth/token/info', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res2.status == 200)
          response.json({response: "ok"});
        else
          response.json({response: "invalid"});
      }
      await client.end();
    } catch(err) {
      //console.log("valid check error:", err);
    }
  }

 /*!
  * @author jinbkim
  * @param[in] sessionID 8zTfJcpx3_FEyv0BEKlr99vGy1A6VN92 같은 세션 아이디
  * @return { user_id: 'jinbkim', nick: '3', avatar_url: '4' } 같은 유저 객체
  * @brief 세션 아이디를 인자로 받아 해당하는 유저 객체를 반환
  */
  fetchUser(sessionID: string) {
    const client = new Client(db);
    client.connect();
    // 세션아이디로 세션 얻기
    client.query(`SELECT * FROM session WHERE sid='${sessionID}';`, (err1, res1) => {
      //console.log(res1.rows[0]);
      // 세션안에 있는 user_id로 유저 객체 얻기
      client.query(`SELECT * FROM users WHERE user_id='${res1.rows[0].sess.userid}';`, (err2, res2) => {
        client.end();
        //console.log('=== fetchUser ===');
        //console.log(res2.rows[0]);
        return res2.rows[0];
      });
    });
  }

 /*!
  * @author jinbkim
  * @param[in] userData 수정될 정보를 가진 유저 객체
  * @brief 
  *   인자로 받은 유저 객체로 유저 정보 수정
  *   user_id는 변하지 않는다고 가정함
  */
  updateUser(userData) {
    const client = new Client(db);
    client.connect();
    //console.log('=== updateUser ===');
    //console.log(userData);
    // 인자로 받은 유저 객체로 유저 정보 수정
    client.query(`UPDATE users SET nick='${userData.nick}', avatar_url='${userData.avatar_url}' WHERE user_id='${userData.user_id}';`, (err, res) => {
      client.end();
    });
  }

 /*!
  * @author jinbkim
  * @param[in] sessionID 8zTfJcpx3_FEyv0BEKlr99vGy1A6VN92 같은 세션 아이디
  * @return { user_id: 'jinbkim', nick: '3', avatar_url: '4' } 삭제된 유저 객체
  * @brief 유저 삭제
  */
  deleteUser(sessionID: string) {
    let deletedUser;  // 삭제될 유저
    const client = new Client(db);
    client.connect();
    // 세션아이디로 세션 얻기
    client.query(`SELECT * FROM session WHERE sid='${sessionID}'`, (err1, res1) => {
      // 세션안에 있는 user_id로 유저 객체 얻기
      client.query(`SELECT * FROM users WHERE user_id='${res1.rows[0].sess.user_id}'`, (err2, res2) => {
        deletedUser = res2.rows[0];
        // 유저 삭제
        client.query(`DELETE FROM users WHERE user_id='${res1.rows[0].sess.user_id}'`, (err3, res3) => {
          client.end();
          //console.log('=== deleteUser ===');
          //console.log(deletedUser);
          return deletedUser;
        });
      });
    });
  }
}

/*!
 * @author hna
 * @brief id와 토큰값을 Session 객체의 속성에 추가하고 Postgres의 session 테이블에 저장.
 * @warning 세션 객체에 새로운 값을 추가하는 경우 main.ts 에서 SessionData 인터페이스에 먼저 추가해야함
 */
export async function saveSession(session: Session & Partial<SessionData>, id: string, token: string) {
  session.userid = id;
  session.token = token;
  session.save(); 
}

/*!
 * @author hna
 * @brief sessionID를 응답 쿠키에 추가한다
 */
function setSessionCookie(res: Response, sessionID: string) {
  res.cookie('sessionID', sessionID, {
    sameSite: 'none',
    httpOnly: true,
    secure: true,
  })
}

/*!
 * @author hna
 * @brief 유저 정보를 DB에 저장한다
 * @todo id를 가지고 테이블에 이미 있는지 확인해야하고, 중복키 에러가 뜨지 않도록 해야함
 */
export async function saveInfo(id: string, avatar_url: string) {
  try {
    await client.connect();
    client.query(
      'INSERT INTO users(user_id, avatar_url) VALUES($1, $2);', 
      [id, avatar_url], 
      (err, res) => {
        client.end()
        if (err){
          //console.log("INSERT Query Error:", err.message);
        };
    })
  } catch (err) {
    //console.log('pg connect error:', err);
  }
}

export async function getInfo(access_token: string) {
  const getUserUrl = "https://api.intra.42.fr/v2/me";
  return axios.get(getUserUrl, {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  });
}

export async function getToken(loginCodeDto: LoginCodeDto) {
  const { code } = loginCodeDto;
  const type = "authorization_code";
  const getTokenUrl = "https://api.intra.42.fr/oauth/token";
  const redirectUrl = `${process.env.BACKEND_SERVER_URL}/mainpage`;
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
