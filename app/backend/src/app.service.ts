import { Injectable, Res } from '@nestjs/common';
import { LoginCodeDto } from './dto/login-token-dto';
import axios, { AxiosResponse } from 'axios';
import { Client } from 'pg';
import { request, response, Request, Response } from 'express';
const qs = require('querystring');

const client = new Client({
	user: process.env.PG_PONG_ADMIN,
	host: process.env.PG_HOST,
	database: process.env.PG_PONG_DB,
	password: process.env.PG_PONG_PW,
	port: +process.env.PG_PORT,
});

@Injectable()
export class AppService {
  
  /*!
   * @author hna
   * @param[in] loginCodeDto Body로 들어온 code
   * @param[in] req Request 객체
   * @brief loginCode를 받아 42api에서 토큰발급 -> 유저 정보 조회 및 저장 (회원가입) -> 세션 저장
   * @todo 42api에서 토큰 발급 실패시 에러처리
   * @todo 유저 정보가 이미 데이터베이스에 있는경우 저장하지 않도록 해야함
   */
  public async login(loginCodeDto: LoginCodeDto, req: Request) {
    // 1. 프론트에서 받은 코드에 우리의 API ID, SECRET, REDIRECT_URL 등을 포함해서 42api에 토큰 발급을 요청한다.
    const result = await getToken(loginCodeDto)
    const { access_token } = result.data
    
		// 2. 토큰을 가지고 42api에 유저 정보를 요청한다.
    const data = await getInfo(access_token)
		// 3. 42 api에서 받은 유저 정보를 DB에 저장한다.
    saveInfo(data.data);
    // 4. 세션을 DB에 저장.
    req.session.userid = data.data.login;
    req.session.save();
  }

  getUser(id: string){
    client.connect();
    client.query(`SELECT * FROM users WHERE user_id='${id}';`, (err, res) => {
      console.log(res.rows);
      return (res.rows);
    });
  }
}

/*!
 * @author hna
 * @param[in] 42api response 데이터 (유저 정보)
 * @brief 유저 정보를 Postgresql에 저장. 
 * @todo 유저 정보가 이미 데이터베이스에 있는경우 저장하지 않도록 해야함
 * @todo ㄴ 중복키 불가하도록 설정
 */
export async function saveInfo(info) {
	client.connect();
	client.query(
    'INSERT INTO users(user_id, avatar_url) VALUES($1, $2);', 
		[info.login, info.image_url], 
		(err, res) => {
			console.log(err, res)
			client.end()
	})
}

export async function getInfo(access_token) {
  const getUserUrl = "https://api.intra.42.fr/v2/me";
  return axios.get(getUserUrl, {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  });
}

export async function getToken(loginCodeDto) {
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
  return axios.post(getTokenUrl, qs.stringify(requestBody), config)
}
