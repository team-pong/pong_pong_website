import { FC, useState, FormEvent, useEffect } from "react";
import "/src/scss/login/LoginTwoFactor.scss";

const LoginTwoFactor: FC = (): JSX.Element => {

  const [code, setCode] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    window.location.href = `${global.BE_HOST}/session/emailCode?code=${code}`;
  }

  return (
    <div className="two-factor-container">
      <div className="top-bar">
        <span>이메일을 확인하세요</span>
      </div>
      <form onSubmit={onSubmit}>
        <input type="text"
          value={code}
          className="text"
          placeholder="코드를 입력하세요"
          onChange={(e) => setCode(e.target.value)}/>
        <input type="submit" value="확인" className="submit"/>
      </form>
    </div>
  );
}

export default LoginTwoFactor;