import EasyFetch from "./EasyFetch";

/*!
 * @author yochoi
 * @brief Login이 된 상태인지 검사하는 함수
 * @detail
 *        1. accessCode 가 있는지 검사
 *          1-1. accessCode를 백엔드로 전송
 *          1-2. 백엔드의 응답이 200이면 true, 그 외면 false
 *        2. 백엔드/auth/valid 로 GET 요청
 *          2-1. 백엔드의 응답이 "ok"면 true, 그 외면 false
 */

const verifyLogin = async (accessCode?: string): Promise<boolean> => {
  if (accessCode) {
    const easyfetch = new EasyFetch('http://127.0.0.1:3001/api/oauth', 'POST');
    const res = await easyfetch.fetch({code: accessCode});
    if (res.status === 200)
      return (true);
  }
  const easyfetch = new EasyFetch('http://127.0.0.1:3001/auth/valid');
  let res = await (await easyfetch.fetch()).json();
  if (res.response === "ok") {
    return (true);
  }
  return (false);
}

export default verifyLogin;