import { useEffect } from "react";
import NavBar from './navbar/NavBar'

const MainPage = (): JSX.Element => {

  const testFriendList = [{
    name: 'yochoi',
    state: 'offline'
  }, {
    name: 'hna',
    state: 'online'
  }, {
    name: 'jinwkim',
    state: 'online'
  }, {
    name: 'jinbkim',
    state: 'offline'
  }, {
    name: 'donglee',
    state: 'online'
  }]

  useEffect(() => {

    const postAuthCodeToBackend = async () => {
      let searchParams: URLSearchParams = new URLSearchParams(window.location.search);
      const fetchOption = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ code: searchParams.get('code') })
      }
      let res = await fetch('http://localhost:3001/api/oauth', fetchOption)
    }

    try {
      postAuthCodeToBackend();
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <>
      <NavBar
        avartarImgUrl="https://static.coindesk.com/wp-content/uploads/2021/04/dogecoin.jpg"
        friends={testFriendList} />
      <h1>main</h1>
    </>
  );
}

export default MainPage;