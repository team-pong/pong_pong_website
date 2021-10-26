import { FC, useEffect, useState, useRef, useContext, Dispatch, SetStateAction } from "react";
import { Link, Route, RouteComponentProps, withRouter } from "react-router-dom";
import AddFriend from "./addFriend/AddFriend";
import FriendList from "./friendlist/FriendList";
import "/src/scss/navbar/NavBar.scss";
import "/src/scss/navbar/NavBar-media.scss";
import "/src/scss/navbar/NavBar-mobile.scss";
import Modal from "../../modal/Modal";
import EasyFetch from "../../../utils/EasyFetch";
import ProfileContent from "../../modal/content/profile/ProfileContent";
import ContactUs from "./contactUs/ContactUs";
import { UserInfoContext } from "../../../Context";
import { UserInfo } from "../MainPage";

interface NavBarProps extends RouteComponentProps {
  update: {state: string, user_id: string};
  mainPageMode: "user" | "admin";
  setMainPageMode: Dispatch<SetStateAction<"user" | "admin">>
}

/*!
 * @author donglee
 * @brief 좌측에 NavBar가 상시 나타나있음
 *        NavBar 버튼들을 누르면 router로 url을 변경해주면서 모달이 뜨게 함
 */

const NavBar: FC<NavBarProps> = (props): JSX.Element => {
  
  const userInfo = useContext(UserInfoContext);

  const [isFriendListOpen, setIsFriendListOpen] = useState(false);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [friendList, setFriendList] = useState<UserInfo[]>(null);

  const avatarImgRef = useRef(null);


  /*!
   * @author donglee
   * @brief FriendList, AddFriend 컴포넌트와 state를 공유하기 위해 이 컴포넌트에서 FriendList를 가져옴
   */
  const getFriendList = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/friend/list`);
    const res = await easyfetch.fetch();

    setFriendList(res.friendList);
  };

  useEffect(() => {
    getFriendList();
  }, [props.update]);

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
        <h2>{userInfo.nick}</h2>
      </header>
      <ul className="nav-ul">
        <li className="nav-list-button" id="nav-friend" onClick={() => setIsFriendListOpen(!isFriendListOpen)}>
          <img className="nav-list-img" src="/public/users.svg"/>
          <span className="nav-list-span">친구</span>
          <img 
            id="icon-plus"
            onClick={(e) => {
              e.stopPropagation();
              setIsAddFriendOpen(!isAddFriendOpen);
            }}
            src="/public/plus.svg"/>
          {isAddFriendOpen ? <AddFriend setState={setIsAddFriendOpen} friendList={friendList} setFriendList={setFriendList} /> : <></>}
        </li>
        {isFriendListOpen ? <FriendList friendList={friendList} setFriendList={setFriendList} /> : <></>}
        <Link to={`${props.match.url}/record`} className="nav-list-button">
          <img className="nav-list-img" src="/public/line-graph.svg"/>
          <span className="nav-list-span">전적</span>
        </Link>
        <Link to={`${props.match.url}/chat`} className="nav-list-button">
          <img className="nav-list-img" src="/public/chat.svg"/>
          <span className="nav-list-span">채팅</span>
        </Link>
        <Link to={`${props.match.url}/game`} className="nav-list-button">
          <img className="nav-list-img" src="/public/controller-play.svg"/>
          <span className="nav-list-span">게임하기</span>
        </Link>
        <div className="end-of-list">
          <Link to={`${props.match.url}/contactUs`} className="nav-list-button">
            <img className="nav-list-img" src="/public/email.png"/>
            <span className="nav-list-span">문의하기</span>
          </Link>
          {userInfo.admin === true &&
            <button className="nav-list-button" onClick={() => {
              props.setMainPageMode(() => {
                if (props.mainPageMode === "user") return ("admin")
                else return ("user")
              })
            }}>
              <img className="nav-list-img" src="/public/tools.svg"/>
              <span className="nav-list-span">{props.mainPageMode === "user" ? "관리자 모드" : "유저 모드"}</span>
            </button>
          }
        </div>
      </ul>
      <Route path={`${props.match.path}/profile/:nick`}><Modal id={Date.now()} content={<ProfileContent />} smallModal/></Route>
      <Route path={`${props.match.path}/contactUs`}><Modal id={Date.now()} content={<ContactUs />} smallModal /></Route>
    </nav>
  );
};

export default withRouter(NavBar);
