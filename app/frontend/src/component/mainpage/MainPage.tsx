import { useEffect } from "react";
import NavBar from './navbar/NavBar'

const MainPage = (): JSX.Element => {

  const testFriendList = [{
    name: 'yochoi',
    state: 'offline',
    avatarURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4wTCccEStV8jOZqrPoK2JmQqsqchyKHmqWg&usqp=CAU'
  }, {
    name: 'hna',
    state: 'online',
    avatarURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuYl9UexgW-fdwSnrL4h_2vx76d9xcVHILbg&usqp=CAU'
  }, {
    name: 'jinwkim',
    state: 'online',
    avatarURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCmI4xQp3fosLJ0Lupjbva7yB-3Av56W3YIw&usqp=CAU'
  }, {
    name: 'jinbkim',
    state: 'offline',
    avatarURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwfTqvgexFFa4mwKdD0yZ0q79b1851t3emTA&usqp=CAU'
  }, {
    name: 'donglee',
    state: 'online',
    avatarURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgn9sQDMA33M2ARHpG_e_T0o6gtaop2XAFvA&usqp=CAU'
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
      let res = await fetch('http://localhost:3001/api/oauth', fetchOption);
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