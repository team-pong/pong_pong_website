import { useState, useEffect } from "react";
import { ModalController } from '../modal/Modal'
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
<<<<<<< HEAD
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
=======
      <button id="record" onClick={() => setIsRecordOpen(true)}>
        <img src="https://img.icons8.com/ios/50/000000/-scoreboard-.png"/>
      </button>
      <button id="chat" onClick={() => setIsChatOpen(true)}>
        <img src="https://img.icons8.com/ios/50/000000/chat--v1.png"/>
      </button>
      <button id="game" onClick={() => setIsGameOpen(true)}>
        <img src="https://img.icons8.com/ios/50/000000/head-to-head.png"/>
      </button>
      <ModalController content={() => <h1>Record</h1>} display={isRecordOpen} closer={() => setIsRecordOpen(false)}/>
      <ModalController content={() => <h1>Chat</h1>} display={isChatOpen} closer={() => setIsChatOpen(false)}/>
      <ModalController content={() => <h1>Game</h1>} display={isGameOpen} closer={() => setIsGameOpen(false)}/>
>>>>>>> f74b32f044814a97e7b63915fd14be310b45ff43
    </>
  );
}

export default MainPage;