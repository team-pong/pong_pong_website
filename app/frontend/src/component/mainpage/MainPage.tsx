import { useState, useEffect } from "react";
import Modal, { ChatContent, ConfigContent, RecordContent } from '../modal/Modal'
import NavBar from './navbar/NavBar'
import '/src/scss/MainPage.scss'
import EasyFetch from './../../utils/EasyFetch';
import { testFriendList } from '../../dummydata/testFriendList';
import { SMALL_MODAL } from "../../utils/constant";
import MyProfileContent from "../modal/content/MyProfileContent";
import { Link, Route, Switch } from "react-router-dom";

/*!
 * @author yochoi, donglee
 * @brief NavBar를 상시 보이게 하고 Record, Match-game, Chat 모달 버튼이 있는 메인페이지
 */

const MainPage = ({match, history, location}): JSX.Element => {

  const [isRecordOpen, setIsRecordOpen] = useState(false); // 전적 모달을 위한 State
  const [isChatOpen, setIsChatOpen] = useState(false); // 채팅 모달을 위한 State
  const [isGameOpen, setIsGameOpen] = useState(false); // 게임, 매치메이킹 모달을 위한 State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isMyProfileOpen, setIsMyProfileOpen] = useState(false);  // 내 프로필 모달을 위한 State
  const [isProfileRecordOpen, setIsProfileRecordOpen] = useState(false);  // 내 프로필에서 상세전적보기 모달을 위한 State

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
        avatarImgUrl="https://cdn.intra.42.fr/users/medium_yochoi.png"
        friends={testFriendList}
        setIsRecordOpen={setIsRecordOpen}
        setIsGameOpen={setIsGameOpen}
        setIsConfigOpen={setIsConfigOpen}
      />
      <main>
        <div id="button-container">
          <Link to={`${match.url}/record`}>
          <div className="buttons" id="record" /*onClick={() => setIsRecordOpen(true)}*/>
            전적
            <span>게임 전적을 보려면 누르세요!</span>
          </div>
          </Link>
          {/* <Link to={`${match.path}/myprofile`}> */}
          <div className="buttons" id="chat" onClick={() => setIsChatOpen(true)}>
            채팅
            <span>친구와 채팅을 하려면 누르세요!</span>
          </div>
          {/* </Link> */}
          <div className="buttons" id="game" onClick={() => setIsGameOpen(true)}>
            게임
            <span>게임을 하려면 누르세요!</span>
          </div>
        </div>
        <Switch>
          <Route path={`${match.path}/myprofile`}><Modal id={Date.now()} content={<MyProfileContent />} modalSize={SMALL_MODAL}/></Route>
          <Route path={`${match.path}/record`}><Modal id={Date.now()} content={<RecordContent/>} /></Route>
        {/* <ModalController id={Date.now()} content={<MyProfileContent stateSetter={setIsProfileRecordOpen}/>} display={isMyProfileOpen} stateSetter={setIsMyProfileOpen} size={SMALL_MODAL}/>
        <ModalController id={Date.now()} content={<RecordContent/>} display={isProfileRecordOpen} stateSetter={setIsProfileRecordOpen}/>
        <ModalController id={Date.now()} content={<RecordContent/>} display={isRecordOpen} stateSetter={setIsRecordOpen}/> */}
        {/* <ModalController content={ChatContent} display={isChatOpen} stateSetter={setIsChatOpen}/>
        <ModalController content={() => <h1>Game</h1>} display={isGameOpen} stateSetter={setIsGameOpen}/>
        <ModalController content={ConfigContent} display={isConfigOpen} stateSetter={setIsConfigOpen}/> */}
        </Switch>
      </main>
    </>
  );
}

export default MainPage;