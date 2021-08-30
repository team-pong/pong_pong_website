import React, { FormEvent, useEffect, useRef, useState } from "react";
import { withRouter, RouteComponentProps, Link, Route } from "react-router-dom";
import "/src/scss/content/myprofile/MyProfileContent.scss";
import Modal from "../../Modal";
import ManageFriendContent from "./ManageFriendContent";
import RecordContent from "../RecordContent";
import EasyFetch from "../../../../utils/EasyFetch";

/*!
 * @author donglee
 * @brief MyProfile 컴포넌트
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

const MyProfileContent: React.FC<RouteComponentProps> = (props) => {

  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [isEditNickClicked, _setIsEditNickClicked] = useState(false);
  const [nickToEdit, setNickToEdit] = useState("");

  const isEditNickClickedRef = useRef(isEditNickClicked); //isEditNickClicked의 ref

  /*!
   * @author donglee
   * @brief ref를 이용해서 state가 비동기로 변하는 것을 기다리지 않고
   *        변화된 즉시 그 값을 활용하기 위해서 current 값에 담아둠
   */
  const setIsEditNickClicked = (data: boolean) => {
    isEditNickClickedRef.current = data;
    _setIsEditNickClicked(data);
  };

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
    setIsEditNickClicked(false);
  };

  /*!
   * @author donglee
   * @brief API /user 에서 프로필 정보를 요청해서 state에 저장함
   */
  const getUserInfo = async (): Promise<UserInfo> => {
    /* TODO: session id로 유저의 정보를 받아오도록 해야 함 */
    const easyfetch = new EasyFetch(`http://127.0.0.1:3001/users/user?user_id=donglee`);
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
    if (isEditNickClickedRef.current) {
      if (e.target !== document.getElementById("mf-edit-img") &&
          e.target !== document.getElementsByClassName("mf-edit-nick")[0]) {
        setIsEditNickClicked(false);
        setNickToEdit(nick);
      }
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
  }, []);

  if (userInfo) {
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
            <img src={userInfo.avatar_url} alt="프로필사진" />
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
              <span className={["mf-nick", isEditNickClicked && "mf-nick-clicked"].join(" ")}>{`${nickToEdit}`}</span>
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
            <div id="user-title">{userInfo.win_games >= 10 && "majesty"}</div>
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
        <Route path={`${props.match.path}/manageFriend`}><Modal id={Date.now()} smallModal content={<ManageFriendContent nick={userInfo.nick}/>} /></Route>
      </div>
    );
  } else {
    return ( <h1>Loading..</h1> );
  }
};

export default withRouter(MyProfileContent);
