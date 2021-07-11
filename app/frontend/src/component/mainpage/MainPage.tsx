import { useState, useEffect } from "react";
import { Modal } from '../modal/Modal'
import NavBar from './navbar/NavBar'
import '/src/scss/MainPage.scss'
import EasyFetch from './../../utils/EasyFetch';
import { testFriendList } from './dummyData'

const MainPage = (): JSX.Element => {

  const [isRecordOpen, setIsRecordOpen] = useState(false); // 전적 모달을 위한 State
  const [isChatOpen, setIsChatOpen] = useState(false); // 채팅 모달을 위한 State
  const [isGameOpen, setIsGameOpen] = useState(false); // 게임, 매치메이킹 모달을 위한 State

  useEffect(() => {

    const postAuthCodeToBackend = async () => {
      let searchParams: URLSearchParams = new URLSearchParams(window.location.search);
      const easyfetch = new EasyFetch('http://127.0.0.1:3001/api/oauth', 'POST');
      await easyfetch.fetch({code: searchParams.get('code')});
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
      <main>
        <div id="button-container">
          <div className="buttons" id="record" onClick={() => setIsRecordOpen(true)}>
            Record
            <span>To see the records of game, click me!</span>
          </div>
          <div className="buttons" id="chat" onClick={() => setIsChatOpen(true)}>
            Chat
            <span>To start a chatting with friends, click me!</span>
          </div>
          <div className="buttons" id="game" onClick={() => setIsGameOpen(true)}>
            Game
            <span>To match a new game, click me!</span>
          </div>
        </div>
        <Modal content={() => <h1>Record</h1>} display={isRecordOpen} handleClose={() => setIsRecordOpen(false)}/>
        <Modal content={() => <h1>Chat</h1>} display={isChatOpen} handleClose={() => setIsChatOpen(false)}/>
        <Modal content={() => <h1>Game</h1>} display={isGameOpen} handleClose={() => setIsGameOpen(false)}/>
      </main>
    </>
  );
}

export default MainPage;