import { useState, useEffect, FC, MouseEvent } from 'react'
import Loading from '../../../loading/Loading';
import EasyFetch from '../../../../utils/EasyFetch';
import ContextMenu from '../contextmenu/ContextMenu'

/*!
 * @author yochoi
 * @brief friend list 를 div로 감싸 반환하는 FC
 */

interface Friend {
	user_id: string;
	nick: string;
	avatar_url: string;
	total_games: number;
	win_games: number;
	loss_games: number;
	ladder_level: number;
	status: string;
}

const FriendList: FC = (props): JSX.Element => {

  const [contextMenuInfo, setContextMenuInfo] = useState<{isOpen: boolean, target: string, xPos: number, yPos: number}>({
    isOpen: false,
    target: "",
    xPos: 0,
    yPos: 0
  });
  const [friendList, setFriendList] = useState<Friend[]>(null);

  const friendOnClick = (e: MouseEvent, target: string) => {
    setContextMenuInfo({
      isOpen: !contextMenuInfo.isOpen,
      target: target,
      xPos: e.pageX,
      yPos: e.pageY
    });
  }

  const friendListGenerator = (friend: Friend, keyIdx: number) => {
    return (
      <div className="friend" key={keyIdx} onClick={(e) => friendOnClick(e, friend.nick)}>
        <img className="flg-friend-avatar" src={friend.avatar_url}/>{friend.nick}
      </div>
    );
  };

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
  
  const getFriendList = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/friend/list`);
    const res = await (await easyfetch.fetch()).json();

    setFriendList(res.friendList);
  };

  useEffect(() => {
    getFriendList();
    addEventListener("keyup", detectESC);
    addEventListener("mousedown", detectOutSide);
    return (() => {
      removeEventListener("keyup", detectESC);
      removeEventListener("mousedown", detectOutSide);
    });
  }, []);

  if (friendList === null || friendList === undefined) {
    return (<Loading width={240} height={35}/>);
  } else if (friendList.length === 0) {
    return (<div style={{
      height: "35px",
      lineHeight: "35px",
      textAlign: "center"
    }}>친구 없음</div>);
  } else {
    return (
      <div id="friend-list-container">
        {friendList.map(friendListGenerator)}
        {contextMenuInfo.isOpen ? <ContextMenu target={contextMenuInfo.target} x={contextMenuInfo.xPos} y={contextMenuInfo.yPos}/> : <></>}
      </div>
    );
  }
}

export default FriendList;