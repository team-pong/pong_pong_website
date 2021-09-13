import { useEffect, useState } from "react";
import Modal, { ChatContent, RecordContent, GameContent } from '../modal/Modal'
import NavBar from './navbar/NavBar'
import "/src/scss/mainpage/MainPage.scss";
import "/src/scss/mainpage/MainPage-media.scss";
import "/src/scss/mainpage/MainPage-mobile.scss";
import EasyFetch from '../../utils/EasyFetch';
import { testFriendList } from '../../dummydata/testFriendList';
import { Link, Route, Switch } from "react-router-dom";
import Loading from "../loading/Loading";

/*!
 * @author yochoi, donglee
 * @brief NavBar를 상시 보이게 하고 Record, Match-game, Chat 모달 버튼이 있는 메인페이지
 */

const MainPage = ({match}): JSX.Element => {
  return (
    <>
      <NavBar friends={testFriendList} />
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
            to={`${match.path}/chat`}
            style={{textDecoration: "none"}}
            className="buttons"
            id="chat">
            채팅
            <span className="mp-explain-span">친구와 채팅을 하려면 누르세요!</span>
          </Link>
          <Link
            to={`${match.path}/game`}
            style={{textDecoration: "none"}}
            className="buttons"
            id="game">
              게임
            <span className="mp-explain-span">게임을 하려면 누르세요!</span>
          </Link>
        </div>
        <Switch>
          <Route path={`${match.path}/record`}><Modal id={Date.now()} content={<RecordContent/>} /></Route>
          <Route path={`${match.path}/chat`}><Modal id={Date.now()} content={<ChatContent/>} /></Route>
          <Route path={`${match.path}/game`}><Modal id={Date.now()} content={<GameContent/>} /></Route>
        </Switch>
      </main>
    </>
  );
}

export default MainPage;