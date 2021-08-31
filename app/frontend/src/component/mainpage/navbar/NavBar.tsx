import { FC, useState } from "react";
import { Link, Route, RouteComponentProps, withRouter } from "react-router-dom";
import AddFriend from "./addFriend/AddFriend";
import FriendList from "./friendlist/FriendList";
import "/src/scss/navbar/NavBar.scss";
import "/src/scss/navbar/NavBar-media.scss";
import "/src/scss/navbar/NavBar-mobile.scss";
import Modal, { ChatContent, RecordContent } from "../../modal/Modal";
import MyProfileContent from "../../modal/content/myprofile/MyProfileContent";

/*!
 * @author donglee
 * @brief 좌측에 NavBar가 상시 나타나있음
 *        NavBar 버튼들을 누르면 router로 url을 변경해주면서 모달이 뜨게 함
 * @param[in] avatarImgUrl: NavBar에 나타나는 본인의 아바타이미지url
 * @param[in] friends: 테스트용 친구목록
 */

interface navBarProps {
  avatarImgUrl: string;
  friends: { name: string; state: string; avatarURL: string }[];
};

const NavBar: FC<navBarProps & RouteComponentProps> = (props): JSX.Element => {

  const [isFriendListOpen, setIsFriendListOpen] = useState(false);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);

  //test
  const myNick = "jinbkim";

  return (
    <nav className="menu">
      <header className="avatar">
        <Link to={`${props.match.url}/profile/${myNick}`}>
        <img
          id="avatarImg"
          src={props.avatarImgUrl}
          alt="Avatar" />
        </Link>
        <h2>Dom Hardy</h2>
      </header>
      <ul>
        <li id="nav-friend" onClick={() => setIsFriendListOpen(!isFriendListOpen)}>
          <img src="/public/users.svg"/>
          <span>친구</span>
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
          <li><img src="/public/line-graph.svg"/><span>전적</span></li>
        </Link>
        <Link to={`${props.match.url}/chat`} style={{color: "inherit", textDecoration: "none"}}>
          <li><img src="/public/chat.svg"/><span>채팅</span></li>
        </Link>
        {/* <Link to={`${props.match.url}/game`} style={{color: "inherit", textDecoration: "none"}}> */}
          <li><img src="/public/controller-play.svg"/><span>게임하기</span></li>
        {/* </Link> */}
      </ul>
      <Route path={`${props.match.path}/record`}><Modal id={Date.now()} content={<RecordContent/>} /></Route>
      <Route path={`${props.match.path}/chat`}><Modal id={Date.now()} content={<ChatContent/>} /></Route>
      {/* <Route path={`${props.match.path}/game`}><Modal id={Date.now()} content={<GameContent/>} /></Route> */}
    </nav>
  );
};

export default withRouter(NavBar);
