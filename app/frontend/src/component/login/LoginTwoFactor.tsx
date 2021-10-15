import { FC, useState, FormEvent } from "react";

const LoginTwoFactor: FC = (): JSX.Element => {

  const [code, setCode] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = 
    await fetch(`${global.BE_HOST}/session/emailCode`, {method: "POST", body: {code: code} as any});
    if (res) alert(JSON.stringify(res));
  }
  return (
    <>
      이메일을 확인하세요
      <form onSubmit={onSubmit}>
        <input type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}/>
        <input type="submit" value="확인"/>
      </form>
    </>
  );
}

export default LoginTwoFactor;