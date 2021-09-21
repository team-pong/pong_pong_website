import React, { Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState } from "react";
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
  const [isBlockedFriend, setIsBlockedFriend] = useState(false);

  const avatarImgRef = useRef(null);

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
    
    if (res.err_msg !== "에러가 없습니다.") {
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
    const easyfetch = new EasyFetch(`${global.BE_HOST}/users/user?user_id=${targetNick}`);
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

  /*!
   * @author donglee
   * @brief 친구 추가 POST 요청 후 버튼을 '친구 삭제'로 바꾸기 위해서 state 업데이트
   */
  const addFriend = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/friend`, "POST");
		const body = {
			"friend_nick": nick
		};
		const res = await (await easyfetch.fetch(body)).json();

		if (res.err_msg !== "에러가 없습니다.") {
			alert(res.err_msg);
		} else {
      setIsAlreadyFriend(true);
    }
  };

  /*!
   * @author donglee
   * @brief 친구 삭제 DELETE 요청 후 버튼을 '친구 추가'로 바꾸기 위해서 state 업데이트
   */
  const deleteFriend = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/friend?friend_nick=${nick}`, "DELETE");
		const res = await (await easyfetch.fetch()).json();

		if (res.err_msg !== "에러가 없습니다.") {
			alert(res.err_msg);
		} else {
      setIsAlreadyFriend(false);
    }
  };

  const sendMessage = () => {
    console.log(`send message to ${nick}`);
  };

  const requestMatch = () => {
    console.log(`request match to ${nick}`);
  }

  /*!
   * @author donglee
   * @brief 친구 차단 후 state 설정(차단하면 친구에서 삭제되므로 isAlreadyFriend state도 설정함)
   */
  const blockFriend = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/block`, "POST");
		const body = {
			"block_nick": nick,
		};
		const res = await (await easyfetch.fetch(body)).json();

		if (res.err_msg !== "에러가 없습니다.") {
			alert("사용자의 닉네임이 변경됐을 수 있습니다. 프로필을 끄고 다시 시도하십시오.");
		} else {
      setIsBlockedFriend(true);
      setIsAlreadyFriend(false);
		}
  }

  /*!
   * @author donglee
   * @brief 친구 차단 해제 후 state 설정
   */
  const unblockFriend = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/block?block_nick=${nick}`, "DELETE");
		const res = await (await easyfetch.fetch()).json();

		if (res.err_msg !== "에러가 없습니다.") {
			alert("사용자의 닉네임이 변경됐을 수 있습니다. 프로필을 끄고 다시 시도하십시오.");
		} else {
      setIsBlockedFriend(false);
		}
  };

  /*!
   * @author donglee
   * @brief 이미 친구인지 아닌지를 먼저 검사해서 state를 설정한다
   */
  const getIsAlreadyFriend = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/friend?friend_nick=${nick}`);
		const res = await (await easyfetch.fetch()).json();

    if (res.bool) {
      setIsAlreadyFriend(true);
    } else {
      setIsAlreadyFriend(false);
    }
  };

  /*!
   * @author donglee
   * @brief 이미 차단한 친구인지 아닌지를 먼저 검사해서 state를 설정한다
   */
  const getIsBlockedFriend = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/block/isBlock?block_nick=${nick}`);
		const res = await (await easyfetch.fetch()).json();

    if (res.bool) {
      setIsBlockedFriend(true);
    } else {
      setIsBlockedFriend(false);
    }
  };

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
   *         이미 친구인지, 차단한 친구인지 정보를 받아온다
   */
  useEffect(() => {
    getUserInfo()
      .then((res) => {setNickToEdit(res.nick); return res;});
    if (!isMyProfile) {
      getIsAlreadyFriend();
      getIsBlockedFriend();
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
            <img className="pr-avatar"
              ref={avatarImgRef}
              src={userInfo.avatar_url}
              onError={() => {avatarImgRef.current.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="}}
              alt="프로필사진" />
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
                <img className="profile-stat-detail" src="/public/search.svg" alt="상세전적보기" title="상세전적보기"/>
              </Link>
            </div>
            <div id="user-title">{setAchievementStr(userInfo.ladder_level)}
              <img id="user-achievement-img" src={setAchievementImg(userInfo.ladder_level)} alt="타이틀로고" />
            </div>
          </div>
        </div>
        <div id="lower-part">
          <div id="blank"></div>
          <div id="delete-user" onClick={!isBlockedFriend ? blockFriend : unblockFriend}>
            <div id="delete-icon">
              <img className="pr-trash-btn" src={!isBlockedFriend ? "/public/block.png" : "/public/unlock.png"} />
            </div>
            {!isBlockedFriend ?
              <span className="pr-explain">클릭하면 해당 유저를 차단합니다.</span>
              : <span className="pr-explain">클릭하면 해당 유저를 차단 해제합니다.</span>
            }
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
