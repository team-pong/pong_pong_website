import { useEffect, useState } from "react";
import "../../../scss/content/MyProfileContent.scss";
import { ModalController } from "../Modal";
import RecordContent from "./RecordContent";

interface UserInfo {
  avatarUrl: string;
  winCnt: number;
  loseCnt: number;
  score: number;
  userTitle: string;
}

const MyProfileContent: React.FC = () => {
  //일단 test용으로 하드코딩 초기화
  const [userNickName, setUserNickName] = useState("Dom Hardy");
  const [userInfo, setUserInfo] = useState<UserInfo>({
    avatarUrl: "./public/me.jpg",
    winCnt: 6,
    loseCnt: 4,
    score: 245,
    userTitle: "Majesty",
  });

  useEffect(() => {
    /* API 이용 fetch로 받아와서 데이터값을 초기화해야 한다 */
  }, [userNickName]); //userNickName은 바뀌면 바로 다시 렌더링 해야 한다.
  /* 같은 이유로 MainPage에 avatarUrl과 nickName 도 state로 있어야 할 것 같다 */

  return (
    <div id="profile">
      <div id="upper-part">
        <div id="button-container">
          <button id="stat-detail" onClick={() => setIsRecordOpen(true)}>
            상세전적보기
          </button>
          <button id="second-auth">2단계 인증</button>
          <button id="manage-friend">친구 관리</button>
        </div>
        <div id="avatar-container">
          <img src={userInfo.avatarUrl} alt="프로필사진" />
        </div>
        <div id="user-info">
          <div id="user-id">
            {`${userNickName} `}
            <img src="./public/pencil.png" alt="편집" />
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
            <img src="./public/delete.png" alt="회원탈퇴" />
          </div>
          <span>클릭하면 회원님의 모든 데이터가 서버에서 삭제됩니다</span>
        </div>
      </div>
    </div>
  );
};

export default MyProfileContent;
