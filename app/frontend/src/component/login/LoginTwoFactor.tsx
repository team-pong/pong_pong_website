import { FC, FormEvent } from "react";

const LoginTwoFactor: FC = (): JSX.Element => {

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("submit")
  }
  return (
    <>
      이메일 확인하세
      <form onSubmit={onSubmit}>
        <input type="text"/>
        <input type="submit" value="확인"/>
      </form>
    </>
  );
}

export default LoginTwoFactor;