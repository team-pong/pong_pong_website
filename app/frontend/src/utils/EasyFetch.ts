/*!
 * @author yochoi
 * @brief fetch를 간편하게 만들어주는 클래스
 * @details
 *        1. const easyfetch = new EasyFetch('url', 'method') // method 는 옵션으로, 안적으면 GET method로 취급됨
 *        2. await easyfetch.fetch(body, header) // body 와 header는 둘다 객체이자 옵션
 */

class EasyFetch {

  private targetURL: string;
  private method: string;

  constructor(url: string, method?: string) {
    this.targetURL = url;
    this.method = method || 'GET';
  }

  async fetch(body?: Object, header?: Object): Promise<any> {
    if (!header) {
      header = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
    if (!body) {
      body = {};
    }
    const fetchOption: any = {
      method: this.method,
      headers: header,
      credentials: 'include',
    }
    if (this.method !== 'GET') {
      fetchOption.body = JSON.stringify(body)
    }
    const res = await (await fetch(this.targetURL, fetchOption)).json();
    if(res.err_msg === "존재하지 않는 세션입니다." || res.statusCode === 403) {
      alert("세션이 만료되었습니다.\n다시 로그인 해주세요.");
      window.location.href = `${global.BE_HOST}`
    };
    return (res);
  }
}

export default EasyFetch;