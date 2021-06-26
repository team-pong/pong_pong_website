import { Injectable } from '@nestjs/common';
import { LoginCodeDto } from './dto/login-token-dto';
import { CLIENT_ID, CLIENT_SECRET } from './config/config.json';
import axios, { AxiosResponse } from 'axios';
const qs = require('querystring');


@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  public async getUserInfo(loginCodeDto: LoginCodeDto) {
    // 42api로 해당 코드를 전송하고 토큰 만들어서 반환함
    const { code } = loginCodeDto;
    const type : string = "authorization_code";
    console.log(`code ${code}`)
    const getTokenUrl: string = "https://api.intra.42.fr/oauth/token";
    const redirectUrl: string = "http://127.0.0.1:3000/mainpage"
    const getUserUrl: string = "https://api.intra.42.fr/oauth/token/info";
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
    axios.post(getTokenUrl, qs.stringify(requestBody), config)
      .then(result => {
        console.log("post success")
        const { access_token } = result.data;
        console.log(access_token)
        const data = axios.get(getUserUrl, {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        })
        .then(result => {
          console.log(result.data);
        })
        .catch((err) => {
          console.log(err);
        })
      })
      .catch((err) => {
        console.log("post error");
      })
    // const { access_token } = response.data;
    // console.log(response.data);
  }
}
