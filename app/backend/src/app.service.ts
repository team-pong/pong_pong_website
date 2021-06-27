import { Injectable } from '@nestjs/common';
import { LoginCodeDto } from './dto/login-token-dto';
import { CLIENT_ID, CLIENT_SECRET } from './config/config.json';
import axios, { AxiosResponse } from 'axios';
import { Client } from 'pg';
const qs = require('querystring');

const client = new Client({
	user: process.env.PG_PONG_ADMIN,
	host: process.env.PG_HOST,
	database: process.env.PG_PONG_DB,
	password: process.env.PG_PONG_PW,
	port: process.env.PG_PORT,
});

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }


  public async getUserInfo(loginCodeDto: LoginCodeDto) {
    // 42api로 해당 코드를 전송하고 토큰 만들어서 반환함
    
    
    const result = await getToken(loginCodeDto)
    const { access_token } = result.data;
    
    const data = await getInfo(access_token)
		saveInfo(data.data);

    // console.log(usual_full_name)
    // const { access_token } = response.data;
    // console.log(response.data);
  }
}

export async function saveInfo(info) {
	client.connect();
	// if DB에 존재하지 않는 사용자면 저장 후 세션생성, 아니면 그냥 세션 생성
	client.query('INSERT INTO users(user_id, user_image_url) VALUES($1, $2);', 
		[info.login, info.image_url], 
		(err, res) => {
			console.log(err, res)
			client.end()
	})
}

export async function getInfo(access_token) {
  const getUserUrl: string = "https://api.intra.42.fr/v2/me";
  return axios.get(getUserUrl, {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  });
}

export async function getToken(loginCodeDto) {
  const { code } = loginCodeDto;
  const type : string = "authorization_code";
  const getTokenUrl: string = "https://api.intra.42.fr/oauth/token";
  const redirectUrl: string = "http://127.0.0.1:3000/mainpage"
  const requestBody = {
    grant_type: type,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
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
