import React, { FormEvent, MouseEvent, useContext, useEffect, useRef, useState } from "react";
import { withRouter, RouteComponentProps, Link, Route, useParams, useLocation } from "react-router-dom";
import "/src/scss/content/profile/ProfileContent.scss";
import Modal, { GameContent } from "../../Modal";
import ManageFriendContent from "./ManageFriendContent";
import RecordContent from "../record/RecordContent";
import EasyFetch from "../../../../utils/EasyFetch";
import { setAchievementImg, setAchievementStr } from "../../../../utils/setAchievement";
import Loading from "../../../loading/Loading";
import { UserInfoContext, SetUserInfoContext, SetDmInfoContext, SetNoticeInfoContext } from "../../../../Context";
import TwoFactorOnOff from "./TwoFactorOnOff";
import { NOTICE_GREEN, NOTICE_RED } from "../../../mainpage/navbar/addFriend/AddFriend";

/*!
 * @author donglee
 * @brief Profile 컴포넌트
 * @detail 사용자 정보를 API에서 받아와서 화면에 렌더링함
 * @param[in] readonly? : 메인화면에서 프로필수정하는 경우를 제외하고는 정보수정이 불가하게 하려는 boolean
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

const ProfileContent: React.FC<{readonly?: boolean} & RouteComponentProps> = (props) => {

  const myInfo = useContext(UserInfoContext);
  const setMyInfo = useContext(SetUserInfoContext);
  const setDmInfo = useContext(SetDmInfoContext);
  const setNoticeInfo = useContext(SetNoticeInfoContext);

  const [otherUserInfo, setOtherUserInfo] = useState<UserInfo>();
  const [isEditNickClicked, setIsEditNickClicked] = useState(false);
  
  const { nick } = useParams<{nick: string}>();
  const {state} = useLocation<{firstLogin: boolean}>();

  const [nickToEdit, setNickToEdit] = useState(nick);
  const [isAlreadyFriend, setIsAlreadyFriend] = useState(false);
  const [isBlockedFriend, setIsBlockedFriend] = useState(false);
  const [isMyProfile, setIsMyProfile] = useState(false);

  const avatarImgRef = useRef(null);

  const mounted = useRef(false);


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
   * @brief POST요청 이후 정상 수정 후에 전역으로 쓰이는 myInfo를 업데이트함
   */
  const updateUserInfoState = () => {
    const newUserInfo = {...myInfo};

    newUserInfo.nick = nickToEdit;
    setMyInfo({...newUserInfo});
  };

  /*!
   * @author donglee
   * @brief API를 통해서 POST 요청으로 닉네임 변경
   * @detail 중복된 닉네임일 경우 원래 닉네임을 다시 표시함.
   */
  const changeNick = async (e: FormEvent) => {
    e.preventDefault();
    const easyfetch = new EasyFetch(`${global.BE_HOST}/users/info`, "POST");
    const body = {
      "user_id": myInfo.user_id,
      "nick": nickToEdit,
      "avatar_url": myInfo.avatar_url
    }
    const res = await easyfetch.fetch(body);

    if (res.err_msg !== "에러가 없습니다.") {
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: `"${nickToEdit}" 은(는) 이미 존재하는 닉네임입니다.`,
        backgroundColor: NOTICE_RED,
      });
      if (mounted.current) setNickToEdit(myInfo.nick);
      return ;
    }
    updateUserInfoState();
    if (mounted.current) setIsEditNickClicked(false);
  };

  /*!
   * @author donglee
   * @brief 이미지 파일을 POST하고 전역객체인 myInfo를 업데이트함
   * @param[in] image: 사용자가 선택한 이미지 파일
   */
  const postAvatarChange = async (image: File) => {
    const formData = new FormData();
    formData.append("image", image);

    const header = {
      'Accept': 'application/json',
    };
    const res = await (await fetch(`${global.BE_HOST}/users/avatar`, {
      method: 'POST',
      headers: header,
      body: formData,
    })).json();

    if (res.avatar_url) {
      setMyInfo({...myInfo, avatar_url: res.avatar_url});
    } else {
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: "아바타 변경에 실패했습니다.",
        backgroundColor: NOTICE_RED,
      });
    }
  };

  /*!
   * @author donglee
   * @brief 아바타 변경 파일을 입력하면 null체크를 한 후 사이즈를 체크함
   */
  const handleChangeAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files.length === 0) return ;
    if (e.target.files[0].size > 2097152) {
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: "파일이 너무 큽니다. 이미지 파일은 2MB 이하여야 합니다.",
        backgroundColor: NOTICE_RED,
      });
      return ;
    }
    postAvatarChange(e.target.files[0]);
  };

  /*!
   * @author donglee
   * @brief 내가 아닌 다른 사용자 프로필 정보를 요청해서 state에 저장함
   */
  const getOtherUserInfo = async (): Promise<UserInfo> => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/users?nick=${nick}`);
    const res = await easyfetch.fetch()

    if (mounted.current) setOtherUserInfo(res);
    return res;
  };

  /*!
   * @author donglee
   * @brief - Enter 누르면 저장, ESC 누르면 취소
   */
  const cancelEditNickKey = (e: React.KeyboardEvent) => {
    if (e.key === "Esc" || e.key === "Escape") {
      setIsEditNickClicked(false);
      setNickToEdit(myInfo.nick);
    }
  };

  /*!
   * @author donglee
   * @detail 닉네임 수정 버튼을 누른 상태에서 input화면과 수정 버튼을 제외한
   *         다른 부분을 눌렀을 때는 수정을 취소하고 원래 닉네임을 보여줌
   */
  const cancelEditNickMouse = (e: MouseEvent, nick: string) => {
    if (e.target !== document.getElementById("mf-edit-img") &&
        e.target !== document.getElementsByClassName("mf-edit-nick")[0]) {
      setIsEditNickClicked(false);
      setNickToEdit(myInfo.nick);
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
    const res = await easyfetch.fetch(body);

    if (res.err_msg !== "에러가 없습니다.") {
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: res.err_msg,
        backgroundColor: NOTICE_RED,
      });
    } else {
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: "친구로 추가했습니다.",
        backgroundColor: NOTICE_GREEN,
      });
      if (mounted.current) setIsAlreadyFriend(true);
    }
  };

  /*!
   * @author donglee
   * @brief 친구 삭제 DELETE 요청 후 버튼을 '친구 추가'로 바꾸기 위해서 state 업데이트
   */
  const deleteFriend = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/friend?friend_nick=${nick}`, "DELETE");
    const res = await easyfetch.fetch()

    if (res.err_msg !== "에러가 없습니다.") {
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: res.err_msg,
        backgroundColor: NOTICE_RED,
      });
    } else {
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: "친구를 삭제했습니다.",
        backgroundColor: NOTICE_GREEN,
      });
      if (mounted.current) setIsAlreadyFriend(false);
    }
  };

  /*!
   * @author donglee
   * @brief 친구에게 DM 보내기
   */
  const sendMessage = () => {
    setDmInfo({
      isDmOpen: true,
      target: nick,
    })
  };

  /*!
   * @author donglee
   * @brief 친구 차단 후 state 설정(차단하면 친구에서 삭제되므로 isAlreadyFriend state도 설정함)
   */
  const blockFriend = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/block`, "POST");
    const body = {
      "block_nick": nick,
    };
    const res = await easyfetch.fetch(body);

    if (res.err_msg !== "에러가 없습니다.") {
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: res.err_msg,
        backgroundColor: NOTICE_RED,
      });
    } else {
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: "사용자를 차단했습니다.",
        backgroundColor: NOTICE_GREEN,
      });
      if (mounted.current) setIsBlockedFriend(true);
      if (mounted.current) setIsAlreadyFriend(false);
    }
  }

  /*!
   * @author donglee
   * @brief 친구 차단 해제 후 state 설정
   */
  const unblockFriend = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/block?block_nick=${nick}`, "DELETE");
    const res = await easyfetch.fetch()

    if (res.err_msg !== "에러가 없습니다.") {
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: res.err_msg,
        backgroundColor: NOTICE_RED,
      });
    } else {
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: "사용자를 차단 해제했습니다.",
        backgroundColor: NOTICE_GREEN,
      });
      if (mounted.current) setIsBlockedFriend(false);
    }
  };

  /*!
   * @author donglee
   * @brief 이미 친구인지 아닌지를 먼저 검사해서 state를 설정한다
   */
  const getIsAlreadyFriend = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/friend?friend_nick=${nick}`);
    const res = await easyfetch.fetch()

    if (mounted.current) setIsAlreadyFriend(!!res.bool);
  };

  /*!
   * @author donglee
   * @brief 이미 차단한 친구인지 아닌지를 먼저 검사해서 state를 설정한다
   */
  const getIsBlockedFriend = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/block/isBlock?block_nick=${nick}`);
    const res = await easyfetch.fetch()

    if (mounted.current) setIsBlockedFriend(!!res.bool);
  };

 /*!
  * @author donglee
  * @detail 닉네임 수정을 눌렀을 때만 click이벤트리스너를 등록하고
  *         닉네임 수정을 취소하거나 완료하면 이벤트리스너를 제거한다.
  */
  let handlerToBeRemoved = null; //이벤트 핸들러 remove를 하기 위해 참조함

  useEffect(() => {
    if (isEditNickClicked) {
      window.addEventListener("click", handlerToBeRemoved = function(e) {cancelEditNickMouse(e, nickToEdit)});
    }
    return (() => window.removeEventListener("click", handlerToBeRemoved));
  }, [isEditNickClicked]);

  /*!
   * @author donglee
   * @detail 내 프로필인지 다른 사용자의 프로필인지 검사한다
   *         다른 사용자의 경우 프로필 정보를 API로 받아온다
   *         이미 친구인지, 차단한 친구인지 정보를 받아온다
   */
  useEffect(() => {
    if (myInfo) {
      setIsMyProfile(nickToEdit === myInfo.nick);
      if (nickToEdit !== myInfo.nick) {
        getOtherUserInfo();
        getIsAlreadyFriend();
        getIsBlockedFriend();
      }
    }
  }, [myInfo]);

  useEffect(() => {
    mounted.current = true;
    if (state) {
      alert("환영합니다! 아바타 이미지를 클릭해서 아바타를 바꿔보세요!\n현재는 42 이미지가 기본으로 설정돼있습니다. \n"+
      "닉네임도 연필 모양을 눌러서 등록하세요!\n현재는 42 인트라 아이디로 기본 설정돼있습니다.")
    }
    return (() => {mounted.current = false});
  }, []);

  if (isMyProfile) {
    return (
      <div id="pr-profile">
        <div className="upper-part">
          <div className="button-container">
            <Link to={`${props.match.url}/record`}>
              <button className="pr-btn">
                상세전적보기
              </button>
            </Link>
            {!props.readonly ?
            <>
              <Link to={`${props.match.url}/twofactor`}>
                <button className="pr-btn">2단계 인증</button>
              </Link>
              <Link to={`${props.match.url}/manageFriend`}>
                <button className="pr-btn">친구 관리</button>
              </Link>
            </> : <></>}
          </div>
          <div id="avatar-container">
            <label htmlFor="input-file">
              <img className="pr-avatar"
                ref={avatarImgRef}
                src={myInfo.avatar_url}
                onError={() => {avatarImgRef.current.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="}}
                alt="프로필사진" />
            </label>
            <input
              id="input-file"
              type="file"
              onChange={(e) => handleChangeAvatar(e)}
              accept="image/*" />
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
                  onKeyDown={(e) => cancelEditNickKey(e)} />
              </form>
              <span className={"mf-nick" + (isEditNickClicked ? " mf-nick-clicked" : "")}>{myInfo.nick}</span>
              {!props.readonly ?
              <img
                id="mf-edit-img"
                src={isEditNickClicked ? "/public/check.png" : "/public/pencil.png"}
                alt="편집"
                onClick={!isEditNickClicked ? activateEdit : submitForm}/>
              : <></>}
            </div>
            <div id="user-stat">
              <span id="win">{myInfo.win_games} 승</span>
              <span className="delimiter">|</span>
              <span id="lose">{myInfo.loss_games} 패</span>
              <span className="delimiter">|</span>
              <span id="score">{myInfo.ladder_level} 점</span>
            </div>
            <div id="user-title">{setAchievementStr(myInfo.ladder_level)}
              <img id="user-achievement-img" src={setAchievementImg(myInfo.ladder_level)} alt="타이틀로고" />
            </div>
          </div>
        </div>
        <div id="lower-part">
          <div id="blank"></div>
          {!props.readonly ?
          <div id="delete-user" onClick={() => window.location.href = `${global.BE_HOST}/session/logout`}>
            <div id="delete-icon">
              <img className="pr-trash-btn" src="/public/delete.png" alt="로그아웃" />
            </div>
            <span className="pr-explain">로그아웃</span>
          </div>
          : <></>}
        </div>
        <Route path={`${props.match.path}/record`}><Modal id={Date.now()} content={<RecordContent nick={myInfo.nick}/>} /></Route>
        <Route path={`${props.match.path}/twofactor`}><Modal id={Date.now()} content={<TwoFactorOnOff />} smallModal/></Route>
        <Route path={`${props.match.path}/manageFriend`}><Modal id={Date.now()} smallModal content={<ManageFriendContent />} /></Route>
      </div>
    );
  }

  if (otherUserInfo) {
    return (
      <div id="pr-profile">
        <div className="upper-part user-profile">
          <div className="button-container user-button-container">
            <button className="pr-btn" onClick={ !isAlreadyFriend ? addFriend : deleteFriend}>
              { !isAlreadyFriend ? "친구 추가" : "친구 삭제" }
            </button>
            <button className="pr-btn" onClick={sendMessage}>메세지 보내기</button>
            {otherUserInfo.status === "online" ?
            <Link 
              to={{pathname:`mainpage/game`, state: {target: otherUserInfo.nick, targetAvatar: otherUserInfo.avatar_url}}}
              style={{color: "inherit", textDecoration: "none"}}>
              <button className="pr-btn">대전 신청</button>
            </Link> : <button className="pr-btn pr-deactivated">대전 신청</button>}
          </div>
          <div id="avatar-container">
            <img className="pr-avatar" src={otherUserInfo.avatar_url} alt="프로필사진" />
          </div>
          <div id="user-info">
            <div id="user-id">
              <span className="mf-nick">{`${nick}`}</span>
            </div>
            <div id="user-stat">
              <span>{otherUserInfo.win_games} 승</span>
              <span className="delimiter">|</span>
              <span>{otherUserInfo.loss_games} 패</span>
              <span className="delimiter">|</span>
              <span>{otherUserInfo.ladder_level} 점</span>
              <Link to={`${props.match.url}/record`}>
                <img className="profile-stat-detail" src="/public/search.svg" alt="상세전적보기" title="상세전적보기"/>
              </Link>
            </div>
            <div id="user-title">{setAchievementStr(otherUserInfo.ladder_level)}
              <img id="user-achievement-img" src={setAchievementImg(otherUserInfo.ladder_level)} alt="타이틀로고" />
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
        <Route path={`${props.match.path}/game`}><Modal id={Date.now()} content={<GameContent/>} /></Route>
      </div>
    );
  }

  return (
    <Loading color="grey" style={{width: "100px", height: "100px", position: "absolute", left: "38%", top: "40%"}} />
  );
};

export default withRouter(ProfileContent);