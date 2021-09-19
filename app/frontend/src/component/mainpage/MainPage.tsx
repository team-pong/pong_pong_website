import Modal, { ChatContent, RecordContent } from '../modal/Modal';
import NavBar from './navbar/NavBar';
import Dm from './dm/Dm';
import "/src/scss/mainpage/MainPage.scss";
import "/src/scss/mainpage/MainPage-media.scss";
import "/src/scss/mainpage/MainPage-mobile.scss";
import { useState } from 'react';
import { Link, Route, Switch } from "react-router-dom";
import Notice from '../notice/Notice';

/*!
 * @author yochoi, donglee
 * @brief NavBar를 상시 보이게 하고 Record, Match-game, Chat 모달 버튼이 있는 메인페이지
 */

const MainPage = ({match}): JSX.Element => {

  const [isDmOpen, setIsDmOpen] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);

  return (
    <>
      <NavBar />
      <main>
        <div id="button-container">
          <Link
            to={`${match.url}/record`}
            style={{textDecoration: "none"}}
            className="buttons"
            id="record">
            전적
            <span className="mp-explain-span">게임 전적을 보려면 누르세요!</span>
          </Link>
          <Link
            to={`${match.url}/chat`}
            style={{textDecoration: "none"}}
            className="buttons"
            id="chat">
            채팅
            <span className="mp-explain-span">친구와 채팅을 하려면 누르세요!</span>
          </Link>
          <Link
            to=""
            style={{textDecoration: "none"}}
            className="buttons"
            id="game">
              게임
            <span className="mp-explain-span">게임을 하려면 누르세요!</span>
          </Link>
          <button onClick={() => setIsNoticeOpen(true)}>asdf</button>
          <Notice 
            seconds={3}
            content="notice"
            isNoticeOpen={isNoticeOpen}
            setIsNoticeOpen={setIsNoticeOpen}/>
          <section id="dm-section">
            <Dm isDmOpen={isDmOpen}/>
            <button id="dm-controll-button" onClick={() => setIsDmOpen(!isDmOpen)}>
              {!isDmOpen && <img className="dm-img dm" src="/public/chat-reverse.svg" />}
              {isDmOpen && <img className="dm-img closer" src="/public/DM-closer.svg" />}
            </button>
          </section>
        </div>
        <Switch>
          <Route path={`${match.path}/record`}><Modal id={Date.now()} content={<RecordContent/>} /></Route>
          <Route path={`${match.path}/chat`}><Modal id={Date.now()} content={<ChatContent/>} /></Route>
          {/* <Route path={`${match.path}/game`}><Modal id={Date.now()} content={<GameContent/>} /></Route> */}
        </Switch>
      </main>
    </>
  );
}

export default MainPage;