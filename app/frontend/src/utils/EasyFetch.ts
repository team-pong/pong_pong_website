/*!
 * @author yochoi
 * @brief fetch를 간편하게 만들어주는 클래스
 * @details
 *        1. const easyfetch = new EasyFetch('url', 'method') // method 는 옵션으로, 안적으면 GET method로 취급됨
 *        2. await easyfetch.fetch(body, header) // body 와 header는 둘다 객체, header는 옵션
 */

class EasyFetch {

  private targetURL: string;
  private method: string;

  constructor(url: string, method?: string) {
    this.targetURL = url;
    this.method = method || 'GET';
  }

  fetch(body: Object, header?: Object): Promise<Response> {
    if (!header) {
      header = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
    const fetchOption: any = {
      method: this.method,
      headers: header,
      origin: "http://127.0.0.1:3000",
      credentials: 'include',
      body: JSON.stringify(body)
    }
    return fetch(this.targetURL, fetchOption);
  }
}

export default EasyFetch;