import { FC, Dispatch, SetStateAction } from "react";
import "/src/scss/content/chat/ChatContextMenu.scss";

interface chatContextMenuProps {
  x: number,
  y: number,
  myPosition: string, /* "owner" || "admin" || "normal" */
  targetPosition: string,
  closer: Dispatch<SetStateAction<{
    isOpen: boolean,
    x: number,
    y: number,
    target: string,
    targetPosition: string
  }>>
}

const ConditionalContextMenu: FC<{myPosition: string, targetPosition: string}> = ({myPosition, targetPosition}) => {
  switch (myPosition) {
    case "owner":
      return (
        <>
          <li className="chat-context-li">{targetPosition === "admin" ? "관리자 해임" : "관리자로 임명"}</li>
          <li className="chat-context-li">강퇴하기</li>
          <li className="chat-context-li">{targetPosition === "mute" ? "대화 차단 해제" : "대화 차단하기"}</li>
        </>
      );
    case "admin":
      if ((targetPosition !== "owner") && (targetPosition !== "admin")) {
        return (
          <>
            <li className="chat-context-li">강퇴하기</li>
            <li className="chat-context-li">{targetPosition === "mute" ? "대화 차단 해제" : "대화 차단하기"}</li>
          </>
        );
      }
  };
}

const ChatContextMenu: FC<chatContextMenuProps> = ({x, y, myPosition, targetPosition, closer}): JSX.Element => {
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
        <li className="chat-context-li">프로필 보기</li>
        <li className="chat-context-li">대전 신청</li>
        <ConditionalContextMenu myPosition={myPosition} targetPosition={targetPosition} />
      </ul>
    </div>
  );
};

export default ChatContextMenu;