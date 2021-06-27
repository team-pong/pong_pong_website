import { useEffect } from "react";
import NavBar from './navbar/NavBar'

const MainPage = (): JSX.Element => {

  useEffect(() => {
    let searchParams: URLSearchParams = new URLSearchParams(window.location.search);
    const fetchOption = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ code: searchParams.get('code') })
    }
    fetch('http://localhost:3001/api/oauth', fetchOption)
  }, []);

  return (
    <>
      <h1>main</h1>
    </>
  );
}

export default MainPage;