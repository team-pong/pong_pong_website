import { FC } from "react";

interface chatContextMenuProps {
  x: number,
  y: number,
  myPosition: string, /* "owner" || "admin" || "user" */
  targetPosition: string
}

const ConditionalContextMenu: FC<{myPosition: string, targetPosition: string}> = ({myPosition, targetPosition}) => {
  switch (myPosition) {
    case "owner":
      return (
        <>
          {targetPosition === "admin" ? <li>관리자 해임</li> : <li>관리자 임명</li>}
          <li>유저 밴</li>
          {targetPosition === "mute" ? <li>뮤트 해제</li> :<li>유저 뮤트</li>}
        </>
      );
    case "admin":
      if ((targetPosition !== "owner") && (targetPosition !== "admin")) {
        return (
          <>
            <li>유저 밴</li>
            {targetPosition === "mute" ? <li>뮤트 해제</li> :<li>유저 뮤트</li>}
          </>
        );
      }
  };
}

const ChatContextMenu: FC<chatContextMenuProps> = ({x, y, myPosition, targetPosition}): JSX.Element => {
  return (
    <ul id="context-menu" style={{ top: y, left: x, }}>
      <li>프로필 보기</li>
      <li>대전 신청</li>
      <ConditionalContextMenu myPosition={myPosition} targetPosition={targetPosition} />
    </ul>
  );
};

export default ChatContextMenu;