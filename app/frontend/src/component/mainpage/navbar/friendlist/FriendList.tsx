import { useState, useEffect, FC, MouseEvent } from 'react'
import ContextMenu from '../contextmenu/ContextMenu'

/*!
 * @author yochoi
 * @brief friend list 를 div로 감싸 반환하는 FC
 * @param[in] friends friend 객체의 배열
 */

interface friend {
  name: string,
  state: string,
  avatarURL: string
}

interface friendListProps {
  friends: friend[]
}

const FriendList: FC<friendListProps> = (props): JSX.Element => {

  const [contextMenuInfo, setContextMenuInfo] = useState<{isOpen: boolean, target: string, xPos: number, yPos: number}>({
    isOpen: false,
    target: "",
    xPos: 0,
    yPos: 0
  });

  const friendOnClick = (e: MouseEvent, target: string) => {
    setContextMenuInfo({
      isOpen: !contextMenuInfo.isOpen,
      target: target,
      xPos: e.pageX,
      yPos: e.pageY
    });
  }

  const friendListGenerator = (friend: friend, keyIdx: number) => {
    return (
      <div className="friend" key={keyIdx} onClick={(e) => friendOnClick(e, friend.name)}>
        <img src={friend.avatarURL}/>{friend.name}
      </div>
    );
  };

  useEffect(() => {
    const detectOutSide = (e: any) => {
      if (!document.getElementById("context-menu")) return;
      if (!document.getElementById("context-menu").contains(e.target)) setContextMenuInfo({
        isOpen: false,
        target: "",
        xPos: 0,
        yPos: 0
      })
    }
    const detectESC = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContextMenuInfo({
        isOpen: false,
        target: "",
        xPos: 0,
        yPos: 0
      })
    };
    addEventListener("keyup", detectESC);
    addEventListener("mousedown", detectOutSide);
    return (() => {
      removeEventListener("keyup", detectESC);
      removeEventListener("mousedown", detectOutSide);
    });
  }, []);

  return (
    <div id="friendListContainer">
      {props.friends.map(friendListGenerator)}
      {contextMenuInfo.isOpen ? <ContextMenu target={contextMenuInfo.target} x={contextMenuInfo.xPos} y={contextMenuInfo.yPos}/> : <></>}
    </div>
  );
}

export default FriendList;