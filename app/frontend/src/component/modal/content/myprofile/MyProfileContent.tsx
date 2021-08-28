import { useEffect, useState } from "react";
import { withRouter, RouteComponentProps, Link, Route } from "react-router-dom";
import "/src/scss/content/myprofile/MyProfileContent.scss";
import Modal from "../../Modal";
import ManageFriendContent from "./ManageFriendContent";
import RecordContent from "../RecordContent";

interface UserInfo {
  avatarUrl: string;
  winCnt: number;
  loseCnt: number;
  score: number;
  userTitle: string;
}

const MyProfileContent: React.FC<RouteComponentProps> = (props) => {
  //일단 test용으로 하드코딩 초기화
  const [userNickName, setUserNickName] = useState("Dom Hardy");
  const [userInfo, setUserInfo] = useState<UserInfo>({
    avatarUrl: "/public/me.jpg",
    winCnt: 6,
    loseCnt: 4,
    score: 245,
    userTitle: "Majesty",
  });

  const [isEditNickClicked, setIsEditNickClicked] = useState(false);
  const [nickToEdit, setNickToEdit] = useState("Dom Hardy");

 /*!
 * @author donglee
 * @brief 닉네임 변경 버튼을 눌렀을 때 현재 닉네임 텍스트가 자동으로 하이라이트되는 함수
 */
  const autoHighlightText = () => {
    const editInput : HTMLInputElement = document.getElementsByClassName("mf-edit-nick")[0] as HTMLInputElement;
    
    setTimeout(() => {
      editInput.focus();
      editInput.select();
    }, 0);
  };

  /*!
  * @author donglee
  * @brief 닉네임 변경 버튼을 눌렀을 때 span 대신에 input태그가 display되도록 함
  */
  const activateEdit = () => {
    setIsEditNickClicked(true);
    autoHighlightText();
  };

  /* TODO: 1. 다른 곳을 클릭했을 때 닉네임수정이 취소돼야 함
           2. 수정완료 했을 때 API 요청하고 다시 렌더링 해야 함 */

  const changeNick = () => {
    console.log("changE!");
    setIsEditNickClicked(false);
  };

  useEffect(() => {
    
    /* API 이용 fetch로 받아와서 데이터값을 초기화해야 한다 */
  }, [userNickName]); //userNickName은 바뀌면 바로 다시 렌더링 해야 한다.
  /* 같은 이유로 MainPage에 avatarUrl과 nickName 도 state로 있어야 할 것 같다 */

  return (
    <div id="profile">
      <div id="upper-part">
        <div id="button-container">
          <Link to={`${props.match.url}/record`}>
            <button id="stat-detail">
              상세전적보기
            </button>
          </Link>
          <button id="second-auth">2단계 인증</button>
          <Link to={`${props.match.url}/manageFriend`}>
            <button id="manage-friend">친구 관리</button>
          </Link>
        </div>
        <div id="avatar-container">
          <img src={userInfo.avatarUrl} alt="프로필사진" />
        </div>
        <div id="user-info">
          <div id="user-id">
            <input
              className={["mf-edit-nick", isEditNickClicked && "mf-edit-nick-clicked"].join(" ")}
              type="text"
              value={nickToEdit}
              onChange={(e) => setNickToEdit(e.target.value)}
              onKeyDown={(e) => {if (e.key === "Enter") changeNick()}} />
            <span className={["mf-nick", isEditNickClicked && "mf-nick-clicked"].join(" ")}>{`${userNickName} `}</span>
            <img
              src={isEditNickClicked ? "/public/check.png" : "/public/pencil.png"}
              alt="편집"
              onClick={!isEditNickClicked ? activateEdit : changeNick}/>
          </div>
          <div id="user-stat">
            <span id="win">{userInfo.winCnt} 승</span>
            <span className="delimiter">|</span>
            <span id="lose">{userInfo.loseCnt} 패</span>
            <span className="delimiter">|</span>
            <span id="score">{userInfo.score} 점</span>
          </div>
          <div id="user-title">{userInfo.userTitle}</div>
        </div>
      </div>
      <div id="lower-part">
        <div id="blank"></div>
        <div id="delete-user">
          <div id="delete-icon">
            <img src="/public/delete.png" alt="회원탈퇴" />
          </div>
          <span>클릭하면 회원님의 모든 데이터가 서버에서 삭제됩니다</span>
        </div>
      </div>
      <Route path={`${props.match.path}/record`}><Modal id={Date.now()} content={<RecordContent/>} /></Route>
      <Route path={`${props.match.path}/manageFriend`}><Modal id={Date.now()} smallModal content={<ManageFriendContent/>} /></Route>
    </div>
  );
};

export default withRouter(MyProfileContent);
