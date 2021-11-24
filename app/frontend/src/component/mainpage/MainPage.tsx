import Modal, { ChatContent, RecordContent, GameContent } from '../modal/Modal';
import { UserInfoContext, SetUserInfoContext, DmInfoContext, SetDmInfoContext } from '../../Context';
import NavBar from './navbar/NavBar';
import AdminView from './adminview/AdminView';
import Dm from './dm/Dm';
import GameSpectateContent from '../modal/content/game/GameSpectateContent';
import { useContext, useEffect, useState } from "react";
import "/src/scss/mainpage/MainPage.scss";
import "/src/scss/mainpage/MainPage-media.scss";
import "/src/scss/mainpage/MainPage-mobile.scss";
import { Link, Redirect, Route, Switch } from "react-router-dom";
import EasyFetch from '../../utils/EasyFetch';

export interface UserInfo {
  avatar_url: string;
  ladder_level: number;
  loss_games: number;
  nick: string;
  status: string;
  total_games: number;
  user_id: string;
  win_games: number;
  admin: boolean;
}

/*!
 * @author yochoi, donglee
 * @brief NavBar를 상시 보이게 하고 Record, Match-game, Chat 모달 버튼이 있는 메인페이지
 */

const MainPage = ({match}): JSX.Element => {

  const [updateFriendList, setUpdateFriendList] = useState({state: "", user_id: ""});
  const [unReadMsg, setUnReadMsg] = useState(false);
  const [firstLogin, setFirstLogin] = useState(false);

  const userInfo = useContext<UserInfo>(UserInfoContext);
  const setUserInfo = useContext(SetUserInfoContext);
  const dmInfo = useContext(DmInfoContext);
  const setDmInfo = useContext(SetDmInfoContext);

  const getUserInfo = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/users/myself`);
    const res = await easyfetch.fetch();
    return res;
  }

  /*!
   * @author donglee, yochoi
   * @brief - 로그인한 사용자 정보를 가져온 후 전역으로 사용될 userInfoState를 업데이트함
   *        - 전역으로 사용될 소켓 연결
   */
  useEffect(() => {
    getUserInfo()
    .then((res) => {
      setUserInfo({...res})
      if (window.location.search.substr(1) === "firstLogin=true") setFirstLogin(true);
    });

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

  /*!
   * @author donglee
   * @troubleShooting socket.on, socket.off 에서 같은 함수를 참조하기 위해 유명함수로 선언
   */
  const socketSenUnReadMsg = () => {
    setUnReadMsg(true);
  };

  useEffect(() => {
    if (!dmInfo.isDmOpen) {
      global.socket.on("dm", socketSenUnReadMsg);
      global.socket.on("chatInvite", socketSenUnReadMsg);
      global.socket.on("gameInvite", socketSenUnReadMsg);
    } else if (dmInfo.isDmOpen) {
      setUnReadMsg(false);
      global.socket.off("dm", socketSenUnReadMsg);
      global.socket.off("chatInvite", socketSenUnReadMsg);
      global.socket.off("gameInvite", socketSenUnReadMsg);
    }
  }, [dmInfo]);

  return (
    <>
      <NavBar update={updateFriendList}/>
      <Switch>
        <Route path={`${match.path}/record`}><Modal id={Date.now()} content={<RecordContent/>} /></Route>
        <Route path={`${match.path}/chat`}><Modal id={Date.now()} content={<ChatContent/>} /></Route>
        <Route path={`${match.path}/game`}><Modal id={Date.now()} content={<GameContent/>} /></Route>
        <Route path={`${match.path}/spectate`}><Modal id={Date.now()} content={<GameSpectateContent />} /></Route>
      </Switch>
      <main>
        <Route path={`${match.path}`}>
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
          </div>
        </Route>
        {userInfo.admin && <Route path={`${match.path}/adminView`}><AdminView /></Route>}
        <section id="dm-section">
          {dmInfo.isDmOpen && <Dm />}
          <button id="dm-controll-button" onClick={() => setDmInfo({isDmOpen: !dmInfo.isDmOpen, target: ""})}>
            {unReadMsg && <div className="un-read-msg">!</div>}
            {!dmInfo.isDmOpen && <img className="dm-img dm" src="/public/chat-reverse.svg" />}
            {dmInfo.isDmOpen && <img className="dm-img closer" src="/public/DM-closer.svg" />}
          </button>
        </section>
      </main>
      {firstLogin && <Redirect push to={{pathname: `/mainpage/profile/${userInfo.nick}`, state: {firstLogin: true}}}/>}
    </>
  );
}

export default MainPage;