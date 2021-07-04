import { useState, useEffect } from "react";
import { Modal } from '../modal/Modal'
import NavBar from './navbar/NavBar'
import { testFriendList } from './dummyData'

const MainPage = (): JSX.Element => {

  const [modalDisplay, setModalDisplay] = useState(false);

  useEffect(() => {

    const postAuthCodeToBackend = async () => {
      let searchParams: URLSearchParams = new URLSearchParams(window.location.search);
      const fetchHeader = new Headers();
      fetchHeader.append('Content-Type', 'application/json');
      fetchHeader.append('Accept', 'application/json');
      const fetchOption: any = {
        method: 'POST',
        headers: fetchHeader,
        origin: "http://127.0.0.1:3000",
        credentials: 'include',
        body: JSON.stringify({ code: searchParams.get('code') })
      }
      await fetch('http://localhost:3001/api/oauth', fetchOption)
      await fetch('http://localhost:3001/cookie', { credentials: 'include' } as any);
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
      <button onClick={() => setModalDisplay(!modalDisplay)}>모달 display test</button>
      <Modal content={() => <h1>content</h1>} display={modalDisplay} handleClose={() => setModalDisplay(false)} />
    </>
  );
}

export default MainPage;