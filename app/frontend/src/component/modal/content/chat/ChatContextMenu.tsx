import { FC, Dispatch, SetStateAction, useContext } from "react";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { Socket } from "socket.io-client";
import { SetDmInfoContext, UserInfoContext } from "../../../../Context";
import "/src/scss/content/chat/ChatContextMenu.scss";

interface chatContextMenuProps {
  x: number,
  y: number,
  myPosition: string, /* "owner" || "admin" || "normal" || "mute" || "ban" */
  targetPosition: string,
  target: string,
  closer: Dispatch<SetStateAction<{
    isOpen: boolean,
    x: number,
    y: number,
    target: string,
    targetPosition: string
  }>>
  socket: Socket,
  channelId: number,
}

const ConditionalContextMenu: FC<{
    myPosition: string,
    targetPosition: string,
    socket: Socket,
    target: string,
    channelId: number,
  }> = (
  {socket, myPosition, targetPosition, target, channelId}) => {

  const addAdmin = () => {
    socket.emit("setAdmin", {nickname: target});
  };

  const deleteAdmin = () => {
    socket.emit("deleteAdmin", {nickname: target});
  };

  const ban = () => {
    const really = confirm(`${target} 님을 정말로 강퇴하시겠습니까?`);
    if (really)
      socket.emit("setBan", {nickname: target});
  };

  const mute = () => {
    /* TODO: socket.emit 으로 누구를 뮤트시킬지를 보내주면(target) 백엔드에서
             mute를 설정하고 다시 chatUsers가 바뀌었다는 것을 방송한다.
             그러면 chatUsers 가 바뀔 때마다 myPosition을 업데이트하니까 그 때
             myPosition 이 mute, ban 인 것을 확인해서 처리하면 될 것 같다. 
             mute와 ban은 admin, owner 에게는 적용이 안 되니까 myPosition에 써도 될 것 같다. */
  };

  const unMute = () => {

  };

  switch (myPosition) {
    case "owner":
      return (
        <>
          <li className="chat-context-li"
              onClick={targetPosition === "admin" ? deleteAdmin : addAdmin}>
            {targetPosition === "admin" ? "관리자 해임" : "관리자로 임명"}
          </li>
          <li className="chat-context-li" onClick={ban}>
            강퇴하기
          </li>
          <li className="chat-context-li"
              onClick={targetPosition === "mute" ? unMute : mute}>
            {targetPosition === "mute" ? "대화 차단 해제" : "대화 차단하기"}
          </li>
        </>
      );
    case "admin":
      if ((targetPosition !== "owner") && (targetPosition !== "admin")) {
        return (
          <>
            <li className="chat-context-li" onClick={ban}>
              강퇴하기
            </li>
            <li className="chat-context-li"
                onClick={targetPosition === "mute" ? unMute : mute}>
              {targetPosition === "mute" ? "대화 차단 해제" : "대화 차단하기"}
            </li>
          </>
        );
      }
    default:
      return <></>
  };
}

const ChatContextMenu: FC<chatContextMenuProps & RouteComponentProps> = (
  {socket, match, x, y, myPosition, targetPosition, target, closer, channelId}): JSX.Element => {
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
        targetPosition: ""
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
            <li className="chat-context-li">대전 신청</li>
            <ConditionalContextMenu
              socket={socket}
              myPosition={myPosition}
              targetPosition={targetPosition}
              target={target}
              channelId={channelId}/>
          </>
          : <></>}
      </ul>
    </div>
  );
};

export default withRouter(ChatContextMenu);