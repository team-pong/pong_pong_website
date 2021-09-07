import React, { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";
import { withRouter, RouteComponentProps, Link, Route, useParams } from "react-router-dom";
import "/src/scss/content/profile/ProfileContent.scss";
import Modal from "../../Modal";
import ManageFriendContent from "./ManageFriendContent";
import RecordContent from "../record/RecordContent";
import EasyFetch from "../../../../utils/EasyFetch";
import { setAchievementImg, setAchievementStr } from "../../../../utils/setAchievement";

/*!
 * @author donglee
 * @brief Profile 컴포넌트
 * @detail 사용자 정보를 API에서 받아와서 화면에 렌더링함
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

/*!
 * @author donglee
 * @param[in] myNickSetter: 프로필 컴포넌트에서 닉네임 수정 시 NavBar에서
 *                         props로 넘어온 setMyNick stateSetter를 바꿔서
 *                         NavBar에서도 업데이트된 nick이 렌더링되도록 함
 * @param[in] myAvatarSetter: 아바타 state setter
 */

interface ProfileContentProps {
  myNickSetter?: Dispatch<SetStateAction<string>>;
  myAvatarSetter?: Dispatch<SetStateAction<string>>;
}

const ProfileContent: React.FC<ProfileContentProps & RouteComponentProps> = (props) => {

  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [isEditNickClicked, setIsEditNickClicked] = useState(false);
  const [nickToEdit, setNickToEdit] = useState("");
  const [isAlreadyFriend, setIsAlreadyFriend] = useState(false);

  //url parameter로 넘어오는 nick 문자열 저장
  const { nick } = useParams<{nick: string}>();
  //test 현재 내 nick은 donglee 이고 param으로 들어온 nick은 jinbkim이니까 false
  const isMyProfile = ("donglee" === nick);

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

  /*!
   * @author donglee
   * @brief POST요청 이후 정상 수정 후에 userInfo를 업데이트함
   */
  const updateUserInfo = () => {
    const newUserInfo = {...userInfo};

    newUserInfo.nick = nickToEdit;
    setUserInfo(newUserInfo);
  };

  /*!
   * @author donglee
   * @brief API를 통해서 POST 요청으로 닉네임 변경
   * @detail 중복된 닉네임일 경우 원래 닉네임을 다시 표시함.
   */
  const changeNick = async (e: FormEvent) => {
    e.preventDefault();
    const easyfetch = new EasyFetch("http://localhost:3001/users/info", "POST");
    const body = {
      "user_id": userInfo.user_id,
      "nick": nickToEdit,
      "avatar_url": userInfo.avatar_url
    }
    const res = await (await easyfetch.fetch(body)).json();
    
    if (res.err_msg !== "Success") {
      alert(`"${nickToEdit}" 은(는) 이미 존재하는 닉네임입니다.`);
      setNickToEdit(userInfo.nick);
      return ;
    }
    updateUserInfo();
    props.myNickSetter(nickToEdit);
    setIsEditNickClicked(false);
  };

  /*!
   * @author donglee
   * @brief API /user 에서 프로필 정보를 요청해서 state에 저장함
   */
  const getUserInfo = async (): Promise<UserInfo> => {
    let targetNick = "";
    if (isMyProfile) {
      targetNick = "donglee";
    } else {
      targetNick = nick;
    }
    /* TODO: session id로 유저의 정보를 받아오도록 해야 함 */
    const easyfetch = new EasyFetch(`http://127.0.0.1:3001/users/user?user_id=${targetNick}`);
    const res = await (await easyfetch.fetch()).json();

    setUserInfo(res);
    return res;
  };

  /*!
   * @author donglee
   * @brief Enter 누르면 저장, ESC 누르면 취소
   */
  const cancelEditNick = (e: React.KeyboardEvent) => {
    if (e.key === "Esc" || e.key === "Escape") {
      setIsEditNickClicked(false);
      setNickToEdit(userInfo.nick);
    }
  };

  /*!
   * @author donglee
   * @detail 닉네임 수정 버튼을 누른 상태에서 input화면과 수정 버튼을 제외한
   *         다른 부분을 눌렀을 때는 수정을 취소하고 원래 닉네임을 보여줌
   */
  const cancelEdit = (e: MouseEvent, nick: string) => {
    if (e.target !== document.getElementById("mf-edit-img") &&
        e.target !== document.getElementsByClassName("mf-edit-nick")[0]) {
      setIsEditNickClicked(false);
      setNickToEdit(nick);
    }
  };

  /*!
   * @author donglee
   * @brief 제출 이미지를 클릭했을 때 form 제출을 요청
   */
  const submitForm = () => {
    const form: HTMLFormElement = document.getElementById("mf-form") as HTMLFormElement;

    form.requestSubmit();
  };

  const addFriend = async () => {
    console.log(`add ${nick}`);
    /* 친구 추가 후에 성공하면 isAlradyFriend state true로 설정 */
  };

  const deleteFriend = async () => {
    console.log(`delete ${nick}`);
    /* 친구 삭제 후에 성공하면 isAlradyFriend state false로 설정 */
  };

  const sendMessage = () => {
    console.log(`send message to ${nick}`);
  };

  const requestMatch = () => {
    console.log(`request match to ${nick}`);
  }

  const blockFriend = () => {
    console.log(`block ${nick}`);
  }

 /*!
  * @author donglee
  * @detail 닉네임 수정을 눌렀을 때만 click이벤트리스너를 등록하고
  *         닉네임 수정을 취소하거나 완료하면 이벤트리스너를 제거한다.
  */
  let handlerToBeRemoved = null; //이벤트 핸들러 remove를 하기 위해 참조함
 
  useEffect(() => {
    if (isEditNickClicked) {
      window.addEventListener("click", handlerToBeRemoved = function(e) {cancelEdit(e, nickToEdit)});
    }
    return (() => window.removeEventListener("click", handlerToBeRemoved));
  }, [isEditNickClicked]);

  /*!
   * @author donglee
   * @detail DB에서 정보를 얻어온 이후에 nickToEdit state를 업데이트한다
   */
  useEffect(() => {
    getUserInfo()
      .then((res) => {setNickToEdit(res.nick); return res;});
    if (!isMyProfile) {
      // const easyfetch = new EasyFetch(`http://localhost:3001/friend?friend_id=${user_nick}&user_id=${mynick}`)
      // const res = await (await easyfetch.fetch()).json();
      // return res;
      // .then((res) => {setIsAlreadyFriend(true)})
      /* API GET call and then set the state  */
    }
  }, []);

  if (userInfo && isMyProfile) {
    return (
      <div id="pr-profile">
        <div className="upper-part">
          <div className="button-container">
            <Link to={`${props.match.url}/record`}>
              <button className="pr-btn">
                상세전적보기
              </button>
            </Link>
            <button className="pr-btn">2단계 인증</button>
            <Link to={`${props.match.url}/manageFriend`}>
              <button className="pr-btn">친구 관리</button>
            </Link>
          </div>
          <div id="avatar-container">
            <img className="pr-avatar" src={userInfo.avatar_url} alt="프로필사진" />
          </div>
          <div id="user-info">
            <div id="user-id">
              <form onSubmit={changeNick} id="mf-form">
                <input
                  className={"mf-edit-nick"  + (isEditNickClicked ? " mf-edit-nick-clicked" : "")}
                  type="text"
                  value={nickToEdit}
                  minLength={2}
                  maxLength={10}
                  required
                  onChange={(e) => setNickToEdit(e.target.value)}
                  onKeyDown={(e) => cancelEditNick(e)} />
              </form>
              <span className={"mf-nick" + (isEditNickClicked ? " mf-nick-clicked" : "")}>{`${userInfo.nick}`}</span>
              <img
                id="mf-edit-img"
                src={isEditNickClicked ? "/public/check.png" : "/public/pencil.png"}
                alt="편집"
                onClick={!isEditNickClicked ? activateEdit : submitForm}/>
            </div>
            <div id="user-stat">
              <span id="win">{userInfo.win_games} 승</span>
              <span className="delimiter">|</span>
              <span id="lose">{userInfo.loss_games} 패</span>
              <span className="delimiter">|</span>
              <span id="score">{userInfo.ladder_level} 점</span>
            </div>
            <div id="user-title">{setAchievementStr(userInfo.ladder_level)}
              <img id="user-achievement-img" src={setAchievementImg(userInfo.ladder_level)} alt="타이틀로고" />
            </div>
          </div>
        </div>
        <div id="lower-part">
          <div id="blank"></div>
          <div id="delete-user">
            <div id="delete-icon">
              <img className="pr-trash-btn" src="/public/delete.png" alt="회원탈퇴" />
            </div>
            <span className="pr-explain">클릭하면 회원님의 모든 데이터가 서버에서 삭제됩니다</span>
          </div>
        </div>
        <Route path={`${props.match.path}/record`}><Modal id={Date.now()} content={<RecordContent nick={nick}/>} /></Route>
        <Route path={`${props.match.path}/manageFriend`}><Modal id={Date.now()} smallModal content={<ManageFriendContent nick={userInfo.nick}/>} /></Route>
      </div>
    );
  } else if (userInfo && !isMyProfile) {
    return (
      <div id="pr-profile">
        <div className="upper-part user-profile">
          <div className="button-container user-button-container">
            <button className="pr-btn" onClick={ !isAlreadyFriend ? addFriend : deleteFriend}>
              { !isAlreadyFriend ? "친구 추가" : "친구 삭제" }
            </button>
            <button className="pr-btn" onClick={sendMessage}>메세지 보내기</button>
            <button className="pr-btn" onClick={requestMatch}>대전 신청</button>
          </div>
          <div id="avatar-container">
            <img className="pr-avatar" src={userInfo.avatar_url} alt="프로필사진" />
          </div>
          <div id="user-info">
            <div id="user-id">
              <span className="mf-nick">{`${nick}`}</span>
            </div>
            <div id="user-stat">
              <span>{userInfo.win_games} 승</span>
              <span className="delimiter">|</span>
              <span>{userInfo.loss_games} 패</span>
              <span className="delimiter">|</span>
              <span>{userInfo.ladder_level} 점</span>
              <Link to={`${props.match.url}/record`}>
                <img className="profile-stat-detail" src="/public/search.svg" alt="상세전적보기" />
              </Link>
            </div>
            <div id="user-title">{setAchievementStr(userInfo.ladder_level)}
              <img id="user-achievement-img" src={setAchievementImg(userInfo.ladder_level)} alt="타이틀로고" />
            </div>
          </div>
        </div>
        <div id="lower-part">
          <div id="blank"></div>
          <div id="delete-user" onClick={blockFriend}>
            <div id="delete-icon">
              <img className="pr-trash-btn" src="/public/block.png" alt="차단" />
            </div>
            <span className="pr-explain">클릭하면 해당 유저를 차단합니다.</span>
          </div>          
        </div>
        <Route path={`${props.match.path}/record`}><Modal id={Date.now()} content={<RecordContent nick={nick}/>} /></Route>
      </div>      
    );
  } else {
    return ( <h1>Loading..</h1> );
  }
};

export default withRouter(ProfileContent);
