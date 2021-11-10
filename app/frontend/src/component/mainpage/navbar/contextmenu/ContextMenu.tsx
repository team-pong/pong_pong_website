import { Dispatch, FC, SetStateAction, useContext } from 'react';
import { Link } from 'react-router-dom';
import { SetDmInfoContext, SetNoticeInfoContext } from '../../../../Context';
import EasyFetch from '../../../../utils/EasyFetch';
import { NOTICE_GREEN, NOTICE_RED } from '../addFriend/AddFriend';

/*!
* @author yochoi
* @brief props 로 x, y 좌표를 받아 해당 위치에 context menu를 띄우는 컴포넌트
* @param[in] x context menu의 x 좌표
* @param[in] y context menu의 y 좌표
* @param[in] setContextMenuInfo 어떤 실행 완료 후에 컴포넌트를 닫기 위한 stateSetter
* @param[in] friendList 친구리스트 변경 시에 state를 업데이트 할 때 사용하기 위해 NavBar에서 오는 state
* @param[in] setFriendList 친구리스트 변경 시에 state를 업데이트 할 때 사용하기 위해 NavBar에서 오는 stateSetter
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

interface contextMenuProps {
  target: string;
  x: number;
  y: number;
  setContextMenuInfo: Dispatch<SetStateAction<{isOpen: boolean, target: string, xPos: number, yPos: number}>>
  friendList: Friend[];
  setFriendList: Dispatch<SetStateAction<Friend[]>>;
}

const ContextMenu: FC<contextMenuProps> =
  ({target, x, y, friendList, setFriendList, setContextMenuInfo}): JSX.Element => {

  const setDmInfo = useContext(SetDmInfoContext);
  const setNoticeInfo = useContext(SetNoticeInfoContext);
  
  /*!
  * @author donglee
  * @brief: 친구 삭제 DELETE 요청 후 state 업데이트
  */
  const deleteFriend = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/friend?friend_nick=${target}`, "DELETE");
    const res = await easyfetch.fetch();
    
    if (res.err_msg === "에러가 없습니다.") {
      const updatedList = friendList.filter((friend) => friend.nick !== target);
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: "친구를 삭제했습니다.",
        backgroundColor: NOTICE_GREEN,
      });
      setFriendList(updatedList);
      setContextMenuInfo({
        isOpen: false,
        target: "",
        xPos: 0,
        yPos: 0
      });
    } else {
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: res.err_msg,
        backgroundColor: NOTICE_RED,
      });
    }
  };

  /*!
  * @author donglee
  * @brief 친구 차단 POST 요청 후 state 업데이트
  */
  const blockFriend = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/block`, "POST");
    const body = {
      "block_nick": target,
    };
    const res = await easyfetch.fetch(body);

    if (res.err_msg !== "에러가 없습니다.") {
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: "사용자의 닉네임이 변경됐을 수 있습니다. 친구관리를 끄고 다시 시도하십시오.",
        backgroundColor: NOTICE_RED,
      });
    } else {
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: "친구를 차단했습니다.",
        backgroundColor: NOTICE_GREEN,
      });
      const updatedList = friendList.filter((friend) => friend.nick !== target);

      setFriendList(updatedList);
    }
  };

  return (
    <ul id="context-menu" style={{ top: y, left: x, }} onClick={() => {
      setContextMenuInfo({
        isOpen: false,
        target: "",
        xPos: 0,
        yPos: 0
      });
    }}>
      <Link
        to={`mainpage/profile/${target}`}
        style={{textDecoration: "none"}}>
        <li className="cm-list">프로필 보기</li>
      </Link>
      <Link
        to={`mainpage/spectate?nick=${target}`}
        style={{textDecoration: "none"}}>
        <li className="cm-list">관전하기</li>
      </Link>
      <li className="cm-list" onClick={() => setDmInfo({isDmOpen: true, target: target})}>메세지 보내기</li>
      <li className="cm-list" onClick={deleteFriend}>친구 삭제</li>
      <li className="cm-list" onClick={blockFriend}>친구 차단</li>
    </ul>
  );
}

export default ContextMenu;