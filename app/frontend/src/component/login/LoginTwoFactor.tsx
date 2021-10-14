import { FC, useState, FormEvent } from "react";

const LoginTwoFactor: FC = (): JSX.Element => {

  const [code, setCode] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("submit")
  }
  return (
    <>
      이메일 확인하세
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