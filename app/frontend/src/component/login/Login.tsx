const Login = (): JSX.Element => {

  const UID: string = `1cbdbdbda9ab3cee5773541a19177fa2ae63ae10751dcf3c40466d9a1f0e3f9f`;

  const loginOnClick = () => {
    window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${UID}&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2Fmainpage&response_type=code`
  }

  return (
    <button onClick={loginOnClick}>LOGIN</button>
  );
}

export default Login;