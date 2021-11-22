import {useContext, useEffect, useRef, useState} from "react";
import EasyFetch from "../../../../utils/EasyFetch";
import "/src/scss/content/profile/ManageFriendContent.scss";
import { setAchievementStr, setAchievementImg } from "../../../../utils/setAchievement";
import Loading from "../../../loading/Loading";
import NoResult from "../../../noresult/NoResult";
import { SetNoticeInfoContext } from "../../../../Context";
import { NOTICE_GREEN, NOTICE_RED } from "../../../mainpage/navbar/addFriend/AddFriend";

export interface Friend {
  user_id: string;
  nick: string;
  avatar_url: string;
  total_games: number;
  win_games: number;
  loss_games: number;
  ladder_level: number;
  status: string;
}

const FriendList: React.FC = () => {

  const [friendList, setFriendList] = useState<Friend[]>();
  const [noResult, setNoResult] = useState(false);

  const setNoticeInfo = useContext(SetNoticeInfoContext);

  const mounted = useRef(false);

  /*!
   * @author donglee
   * @brief 친구목록이 수정될 때 리스트가 없으면 결과없음을 보여주기 위해 검사함
   */
  const checkListLength = (list: Friend[]) => {
    if (list.length === 0) {
      setNoResult(true);
    }
  };

  /*!
   * @author donglee
   * @brief 친구 삭제 POST 요청 후 성공하면 state를 해당 친구를 제거한 상태로 업데이트한다
   */
  const deleteFriend = async (nick: string) => {
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
      const updatedList = friendList.filter((friend) => friend.nick !== nick);
      if (mounted.current) setFriendList(updatedList);
      checkListLength(updatedList);
    }
  };

  /*!
   * @author donglee
   * @brief 친구 차단 POST 요청 후 성공하면 state를 해당 친구를 제거한 상태로 업데이트한다
   */
  const blockFriend = async (nick: string) => {
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
        content: "친구를 차단했습니다.",
        backgroundColor: NOTICE_GREEN,
      });
      const updatedList = friendList.filter((friend) => friend.nick !== nick);
      if (mounted.current) setFriendList(updatedList);
      checkListLength(updatedList);
    }
  };

  const getFriendList = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/friend/list`);
    const res = await easyfetch.fetch();

    if (res.friendList.length === 0 && mounted.current) {
      setNoResult(true);
    } else if (mounted.current) setFriendList(res.friendList);
  }

  useEffect(() => {
    mounted.current = true;
    getFriendList();
    return (() => {mounted.current = false});
  },[]);

  if (noResult) {
    return ( <NoResult text="추가한 친구가 없습니다." style={{position: "absolute", left: "22%", top: "28%"}}/> );
  }
  if (friendList) {
    return (
      <ul>
        {friendList.map((friend, key) => {
          return (
            <li key={key}>
              <div className="fl-user-info">
                <img className="fl-avatar" src={friend.avatar_url} alt="프로필" />
                <div className="fl-user-info-text">
                  <span className="fl-nickname">{friend.nick}</span>
                  <span className="fl-title">{setAchievementStr(friend.ladder_level)}</span>
                  <img className="fl-title-icon" src={setAchievementImg(friend.ladder_level)} alt="타이틀로고" />
                </div>
              </div>
              <div className="fl-buttons">
                <img
                  className="fl-delete-friend"
                  title="친구 삭제"
                  src="/public/trashcan.png"
                  alt="친구삭제"
                  onClick={() => deleteFriend(friend.nick)} />
                <img
                  className="fl-block-friend"
                  title="친구 차단"
                  src="/public/block.png"
                  alt="친구차단"
                  onClick={() => blockFriend(friend.nick)} />
              </div>
            </li>
          );
        })}
      </ul>
    );
  } else {
    return ( <Loading color="grey" style={{width: "100px", height: "100px", position: "absolute", left: "37%"}}/> );
  }
}

const BlockedList: React.FC = () => {

  const [blockedList, setBlockedList] = useState<Friend[]>();
  const [noResult, setNoResult] = useState(false);
  const setNoticeInfo = useContext(SetNoticeInfoContext);

  const mounted = useRef(false);

  const unblockFriend = async (nick: string) => {
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
      const updatedList = blockedList.filter((friend) => friend.nick !== nick);
      if (mounted.current) setBlockedList(updatedList);
      if (updatedList.length === 0) {
        if (mounted.current) setNoResult(true);
      }
    }
  };

  const getBlockedList = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/block`);
    const res = await easyfetch.fetch()

    if (res.blockList.length === 0 && mounted.current) {
      setNoResult(true);
    } else if (mounted.current) setBlockedList(res.blockList);
  };

  useEffect(() => {
    mounted.current = true;
    getBlockedList();
    return (() => {mounted.current = false});
  },[]);

  if (noResult) {
    return ( <NoResult text="차단한 친구가 없습니다." style={{position: "absolute", left: "22%", top: "28%"}}/> );
  }
  if (blockedList) {
    return (
      <ul>
        {blockedList.map((blocked, key) => {
          return (
            <li key={key}>
              <div className="fl-user-info">
                <img className="fl-avatar" src={blocked.avatar_url} alt="프로필" />
                <div className="fl-user-info-text">
                  <span className="fl-nickname">{blocked.nick}</span>
                  <span className="fl-title">{setAchievementStr(blocked.ladder_level)}</span>
                  <img className="fl-title-icon" src={setAchievementImg(blocked.ladder_level)} alt="타이틀로고" />
                </div>
              </div>
              <div className="fl-buttons">
                <span className="bl-unblock" onClick={() => unblockFriend(blocked.nick)}>차단 해제</span>
              </div>
            </li>
          );
        })}
      </ul>
    );
  } else {
    return ( <Loading color="grey" style={{width: "100px", height: "100px", position: "absolute", left: "37%"}}/> );
  }
}

const ManageFriendContent: React.FC = () => {
  const [isBlockedSelected, setIsBlockedSelected] = useState(false);

  return (
    <div id="manage-friend">
      <div className="selectors">
        <div className="top-bar">
          <span>친구관리</span>
        </div>
        <div className="navigator">
          <div
            className={["selector", !isBlockedSelected && "selected"].join(" ")}
            onClick={() => setIsBlockedSelected(false)}>
            <label className="list-text">친구 목록</label>
          </div>
          <div
            className={["selector", isBlockedSelected && "selected"].join(" ")}
            onClick={() => setIsBlockedSelected(true)}>
            <label className="list-text">차단한 사용자</label>
          </div>
        </div>
      </div>
      <div className="selected-list">
        {!isBlockedSelected && <FriendList />}
        {isBlockedSelected && <BlockedList />}
      </div>
    </div>
  );
}

export default ManageFriendContent;