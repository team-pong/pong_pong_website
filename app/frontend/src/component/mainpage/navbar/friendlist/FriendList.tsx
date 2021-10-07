import { useState, useEffect, FC, MouseEvent, Dispatch, SetStateAction } from 'react'
import EasyFetch from '../../../../utils/EasyFetch';
import Loading from '../../../loading/Loading';
import NoResult from '../../../noresult/NoResult';
import ContextMenu from '../contextmenu/ContextMenu'

/*!
 * @author yochoi
 * @param[in] friendList ContextMenu 컴포넌트에 NavBar의 state를 넘겨주기 위함
 * @param[in] setFriendList ContextMenu 컴포넌트에 NavBar의 stateSetter를 넘겨주기 위함
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

interface FriendListProps {
  friendList: Friend[];
  setFriendList: Dispatch<SetStateAction<Friend[]>>;
}

const FriendList: FC<FriendListProps> = ({friendList, setFriendList}): JSX.Element => {

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

  const friendListGenerator = (friend: Friend, keyIdx: number) => {
    return (
      <div className="friend" key={keyIdx} onClick={(e) => friendOnClick(e, friend.nick)}>
        <div className="flg-icon-container">
          <img className="flg-friend-avatar" src={friend.avatar_url}/>
          <img className="flg-friend-status" src={`/public/status/${friend.status}.svg`} />
        </div>
        {friend.nick}
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

  /*!
   * @author donglee
   * @brief 이 컴포넌트를 새로 열 때마다 백엔드에서 친구목록 정보를 가져옴
   */
  const getFriendList = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/friend/list`);
    const res = await easyfetch.fetch();

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
    return (<Loading color="#fff" style={{width: "50px", height: "50px", marginLeft: "50px"}}/>);
  } else {
    return (
      <div id="friend-list-container">
        {friendList.length === 0 && 
            <NoResult
              text="친구 없음"
              style={{
                width: "30px",
                height: "30px",
                marginLeft: "30px"}}/>}
        {friendList.map(friendListGenerator)}
        {contextMenuInfo.isOpen ?
          <ContextMenu
            target={contextMenuInfo.target}
            x={contextMenuInfo.xPos}
            y={contextMenuInfo.yPos}
            setContextMenuInfo={setContextMenuInfo}
            friendList={friendList}
            setFriendList={setFriendList} />
            : <></>}
      </div>
    );
  }
}

export default FriendList;