import { FC, Dispatch, SetStateAction, useContext } from "react";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { Socket } from "socket.io-client";
import { SetDmInfoContext, UserInfoContext } from "../../../../Context";
import "/src/scss/content/chat/ChatContextMenu.scss";

interface chatContextMenuProps {
  x: number,
  y: number,
  myPosition: string, /* "owner" || "admin" || "normal" */
  targetPosition: string, /* "owner" || "admin" || "normal" */
  targetState: string, /* "mute" || "ban" || "normal" */
  target: string,
  closer: Dispatch<SetStateAction<{
    isOpen: boolean,
    x: number,
    y: number,
    target: string,
    targetPosition: string,
    targetAvatar: string,
  }>>
  socket: Socket,
  targetAvatar: string,
  targetStatus: string,
}

const ConditionalContextMenu: FC<{
    myPosition: string,
    targetPosition: string,
    targetState: string,
    socket: Socket,
    target: string,
  }> = (
  {socket, myPosition, targetPosition, target, targetState}) => {

  /*!
   * @author donglee
   * @brief 관리자 임명
   */
  const addAdmin = () => {
    socket.emit("setAdmin", {nickname: target});
  };

  /*!
   * @author donglee
   * @brief 관리자 해임
   */
  const deleteAdmin = () => {
    socket.emit("deleteAdmin", {nickname: target});
  };

  /*!
   * @author donglee
   * @brief 강퇴하기
   */
  const ban = () => {
    const really = confirm(`${target} 님을 정말로 강퇴하시겠습니까?`);
    if (really)
      socket.emit("setBan", {nickname: target});
  };

  /*!
   * @author donglee
   * @brief 대화 차단하기
   */
  const mute = () => {
    socket.emit("setMute", {nickname: target});
  };

  /*!
   * @author donglee
   * @brief 대화 차단 해제
   */
  const unMute = () => {
    socket.emit("unMute", {nickname: target});
  };

  switch (myPosition) {
    case "owner":
      return (
        <>
          <li className="chat-context-li"
              onClick={targetPosition === "admin" ? deleteAdmin : addAdmin}>
            {targetPosition === "admin" ? "관리자 해임" : "관리자로 임명"}
          </li>
          <li className="chat-context-li"
              onClick={targetState === "mute" ? unMute : mute}>
            {targetState === "mute" ? "차단 해제" : "차단하기"}
          </li>
          <li className="chat-context-li" onClick={ban}>
            강퇴하기
          </li>
        </>
      );
    case "admin":
      if ((targetPosition !== "owner") && (targetPosition !== "admin")) {
        return (
          <>
            <li className="chat-context-li"
                onClick={targetState === "mute" ? unMute : mute}>
              {targetState === "mute" ? "차단 해제" : "차단하기"}
            </li>
            <li className="chat-context-li" onClick={ban}>
              강퇴하기
            </li>
          </>
        );
      }
    default:
      return <></>
  };
}

const ChatContextMenu: FC<chatContextMenuProps & RouteComponentProps> = (
  {socket, match, x, y, myPosition, targetPosition, targetState, target, closer, targetAvatar, targetStatus}): JSX.Element => {
  const myInfo = useContext(UserInfoContext);
  const setDmInfo = useContext(SetDmInfoContext);

  return (
    <div id="chat-context-menu" onClick={() => {
      document.getElementById("chat-room-users").style.overflowY = "auto";
      closer({
        isOpen: false,
        x: 0,
        y: 0,
        target: "",
        targetPosition: "",
        targetAvatar: "",
      })
    }}>
      <ul id="context-menu" style={{ top: y, left: x, }}>
        <Link to={`${match.url}/profile/${target}`} style={{color: "inherit", textDecoration: "none"}}>
          <li className="chat-context-li">프로필 보기</li>
        </Link>
        {myInfo.nick !== target ? 
          <>
            <li className="chat-context-li" onClick={() => setDmInfo({isDmOpen: true, target: target})}>
              DM 보내기
            </li>
            {targetStatus === "ongame" && 
            <Link
              to={`${match.url}/spectate?nick=${target}`}
              style={{color: "inherit", textDecoration: "none"}}>
              <li className="chat-context-li">관전하기</li>
            </Link>}
            {/* 대전신청을 누르면 GameContent로 라우팅한다 대화방을 나가지 않은 상태에서 */}
            <Link 
              to={{pathname:`${match.url}/game`, state: {target: target, targetAvatar: targetAvatar}}}
              style={{color: "inherit", textDecoration: "none"}}>
              <li className="chat-context-li">대전 신청</li>
            </Link>
            <ConditionalContextMenu
              socket={socket}
              myPosition={myPosition}
              targetPosition={targetPosition}
              targetState={targetState}
              target={target}/>
          </>
          : <></>}
      </ul>
    </div>
  );
};

export default withRouter(ChatContextMenu);