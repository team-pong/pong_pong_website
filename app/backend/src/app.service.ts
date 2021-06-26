import { Injectable } from '@nestjs/common';
import { LoginCodeDto } from './dto/login-token-dto';
import axios, { AxiosResponse } from 'axios';
import { CLIENT_ID, CLIENT_SECRET } from './config/config.json'


@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  public async getUserInfo(loginCodeDto: LoginCodeDto) {
    // 42api로 해당 코드를 전송하고 토큰 만들어서 반환함
    const { code } = loginCodeDto;
    const type : string = "autorization_code";
    const getTokenUrl: string = "https://api.intra.42.fr/oauth/token";
    const request = {
      type,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
    };
    const response: AxiosResponse = await axios.post(getTokenUrl, request, {
      headers: {
        accept: 'application/json',
      },
    });
    if (response.data.error) {
      return console.log("인증 실패함");
    }
    const { access_token } = response.data;
    console.log(response.data);
  }
}
