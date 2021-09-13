import { FC, useEffect, useState, useRef } from "react";
import { Link, Route, RouteComponentProps, withRouter } from "react-router-dom";
import AddFriend from "./addFriend/AddFriend";
import FriendList from "./friendlist/FriendList";
import "/src/scss/navbar/NavBar.scss";
import "/src/scss/navbar/NavBar-media.scss";
import "/src/scss/navbar/NavBar-mobile.scss";
import Modal, { ChatContent, RecordContent, GameContent } from "../../modal/Modal";
import EasyFetch from "../../../utils/EasyFetch";
import ProfileContent from "../../modal/content/profile/ProfileContent";

/*!
 * @author donglee
 * @brief 좌측에 NavBar가 상시 나타나있음
 *        NavBar 버튼들을 누르면 router로 url을 변경해주면서 모달이 뜨게 함
 * @param[in] friends: 테스트용 친구목록
 */

interface navBarProps {
  friends: { name: string; state: string; avatarURL: string }[];
};

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

const NavBar: FC<navBarProps & RouteComponentProps> = (props): JSX.Element => {

  const [isFriendListOpen, setIsFriendListOpen] = useState(false);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [myNick, setMyNick] = useState("");
  const [myAvatar, setMyAvatar] = useState("");

  const avatarImgRef = useRef(null);

  /*!
   * @author donglee
   * @brief API /user 에서 프로필 정보를 요청해서 state에 저장함
   */
  const getUserInfo = async () => {
    //test session id로 받아와야 하는데 일단 donglee꺼 받아옴
    const easyfetch = new EasyFetch(`http://127.0.0.1:3001/users/user?user_id=donglee`);
    const res = await (await easyfetch.fetch()).json();

    setUserInfo(res);
    return res;
  };

  useEffect(() => {
    getUserInfo()
      .then((res) => setMyNick(res.nick));
  },[]);

  if (userInfo) {
    return (
      <nav className="menu">
        <header className="avatar">
          <Link to={`${props.match.url}/profile/${userInfo.nick}`}>
          <img
            id="avatarImg"
            ref={avatarImgRef}
            src={userInfo.avatar_url}
            onError={() => {
              avatarImgRef.current.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
            }}
            alt="Avatar" />
          </Link>
          <h2>{myNick}</h2>
        </header>
        <ul className="nav-ul">
          <li className="nav-list-button" onClick={() => setIsFriendListOpen(!isFriendListOpen)}>
            <img className="nav-list-img" src="/public/users.svg"/>
            <span className="nav-list-span">친구</span>
            <img 
              id="icon-plus"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddFriendOpen(!isAddFriendOpen);
              }}
              src="/public/plus.svg"/>
            {isAddFriendOpen ? <AddFriend setState={setIsAddFriendOpen}/> : <></>}
          </li>
          {isFriendListOpen ? <FriendList friends={props.friends}/> : <></>}
          <Link to={`${props.match.url}/record`} style={{color: "inherit", textDecoration: "none"}}>
            <li className="nav-list-button">
              <img className="nav-list-img" src="/public/line-graph.svg"/>
              <span className="nav-list-span">전적</span>
            </li>
          </Link>
          <Link to={`${props.match.url}/chat`} style={{color: "inherit", textDecoration: "none"}}>
            <li className="nav-list-button">
              <img className="nav-list-img" src="/public/chat.svg"/>
              <span className="nav-list-span">채팅</span>
            </li>
          </Link>
          <Link to={`${props.match.url}/game`} style={{color: "inherit", textDecoration: "none"}}>
            <li className="nav-list-button">
              <img className="nav-list-img" src="/public/controller-play.svg"/>
              <span className="nav-list-span">게임하기</span>
            </li>
          </Link>
        </ul>
        <Route path={`${props.match.path}/profile/:nick`}><Modal id={Date.now()} content={<ProfileContent myNickSetter={setMyNick} myAvatarSetter={setMyAvatar}/>} smallModal/></Route>
        <Route path={`${props.match.path}/record`}><Modal id={Date.now()} content={<RecordContent/>} /></Route>
        <Route path={`${props.match.path}/chat`}><Modal id={Date.now()} content={<ChatContent/>} /></Route>
        <Route path={`${props.match.path}/game`}><Modal id={Date.now()} content={<GameContent/>} /></Route>
      </nav>
    );
  } else {
    return ( <h1>Loading...</h1> );
  }
};

export default withRouter(NavBar);
