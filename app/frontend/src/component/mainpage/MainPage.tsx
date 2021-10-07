import Modal, { ChatContent, RecordContent, GameContent } from '../modal/Modal';
import NavBar from './navbar/NavBar';
import Dm from './dm/Dm';
import { createContext, useEffect, useState } from "react";
import "/src/scss/mainpage/MainPage.scss";
import "/src/scss/mainpage/MainPage-media.scss";
import "/src/scss/mainpage/MainPage-mobile.scss";
import { Link, Route, Switch } from "react-router-dom";
import EasyFetch from '../../utils/EasyFetch';
import Loading from '../loading/Loading';

/*!
 * @author yochoi, donglee
 * @brief NavBar를 상시 보이게 하고 Record, Match-game, Chat 모달 버튼이 있는 메인페이지
 */

interface UserInfo {
  user_id: string;
  nick: string;
  avatar_url: string;
  total_games: number;
  win_games: number;
  loss_games: number;
  ladder_level: number;
  status: string;
}

export const UserInfoContext = createContext(null);

const MainPage = ({match}): JSX.Element => {

  const [isDmOpen, setIsDmOpen] = useState(false);
  const [updateFriendList, setUpdateFriendList] = useState({state: "", user_id: ""});
  const [unReadMsg, setUnReadMsg] = useState(1);
  const [userInfo, setUserInfo] = useState<UserInfo>(null);

  const getUserInfo = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/users/myself`);
    const res = await easyfetch.fetch();

    if (res.err_msg) return null;
    setUserInfo(res);
    return res;
  }

  useEffect(() => {
    getUserInfo();
    global.socket.on("online", ({user_id}) => {
      setUpdateFriendList({state: "online", user_id: user_id});
    });
    global.socket.on("offline", ({user_id}) => {
      setUpdateFriendList({state: "offline", user_id: user_id});
    });
    global.socket.on("ongame", ({user_id}) => {
      setUpdateFriendList({state: "ongame", user_id: user_id});
    });
  }, []);

  if (userInfo) {
    return (
      <>
        {console.log("MyInfo: ", userInfo)}
        <UserInfoContext.Provider value={userInfo}>
        <NavBar update={updateFriendList}/>
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
              to={`${match.path}/game`}
              style={{textDecoration: "none"}}
              className="buttons"
              id="game">
                게임
              <span className="mp-explain-span">게임을 하려면 누르세요!</span>
            </Link>
            <section id="dm-section">
              <Dm isDmOpen={isDmOpen}/>
              <button id="dm-controll-button" onClick={() => setIsDmOpen(!isDmOpen)}>
                {unReadMsg && <div className="un-read-msg">{unReadMsg}</div>}
                {!isDmOpen && <img className="dm-img dm" src="/public/chat-reverse.svg" />}
                {isDmOpen && <img className="dm-img closer" src="/public/DM-closer.svg" />}
              </button>
            </section>
          </div>
          <Switch>
            <Route path={`${match.path}/record`}><Modal id={Date.now()} content={<RecordContent/>} /></Route>
            <Route path={`${match.path}/chat`}><Modal id={Date.now()} content={<ChatContent/>} /></Route>
            <Route path={`${match.path}/game`}><Modal id={Date.now()} content={<GameContent/>} /></Route>
          </Switch>
        </main>
        </UserInfoContext.Provider>
      </>
    );
  }
  return <></>;
}

export default MainPage;