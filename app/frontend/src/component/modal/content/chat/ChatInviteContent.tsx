import "../../../../scss/content/chat/ChatInviteContent.scss";
import {Dispatch, FC, SetStateAction, useContext, useEffect, useRef, useState} from "react";
import { DmInfo, SetDmInfoContext, SetNoticeInfoContext, UserInfoContext } from "../../../../Context";
import EasyFetch from "../../../../utils/EasyFetch";
import { setAchievementImg, setAchievementStr } from "../../../../utils/setAchievement";
import { Friend } from "../profile/ManageFriendContent";
import NoResult from "../../../noresult/NoResult";
import { UserInfo } from "../../../mainpage/MainPage";
import { ChatUser } from "./ChatRoomContent";
import { NOTICE_RED } from "../../../mainpage/navbar/addFriend/AddFriend";

/*!
 * @author donglee
 * @brief 검색 결과를 보여주는 FC
 * @param[in] result: 검색 결과를 담은 UserInfo 객체
 * @param[in] setDmInfo: 초대하기를 DM으로 보내기 위함
 * @param[in] chatTitle: 초대하기를 할 때 전달할 대화방 이름
 * @param[in] setDmInfo: 초대하기를 할 때 전달할 대화방 channelId
 */

interface ResultProps {
  result: UserInfo,
  setDmInfo: Dispatch<SetStateAction<DmInfo>>,
  chatTitle: string,
  channelId: number,
  myInfo: UserInfo,
  chatUsers: ChatUser[],
};

const Result: FC<ResultProps> = (
  {result, setDmInfo, chatTitle, channelId, myInfo, chatUsers}): JSX.Element => {

  const setNoticeInfo = useContext(SetNoticeInfoContext);
  /*!
   * @author donglee
   * @brief 대화방 내부에 초대할 사람이 이미 있는지 검사해서 여부를 boolean으로 반환
   */
  const isAlreadyHere = (to: string): boolean => {
    return (chatUsers.some((user) => {
      return user.nick === to;
    }));
  };

  /*!
   * @author donglee
   * @brief 이미 대화방에 있는지 검사 후 DM을 보냄
   */
  const sendInvite = (to: string) => {
    if (isAlreadyHere(to)) {
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: `${to} 님은 이미 대화방에 참여중입니다.`,
        backgroundColor: NOTICE_RED,
      });
      return ;
    }
    setDmInfo({
      isDmOpen: true,
      target: to,
      chatRequest: {
        from: myInfo.nick,
        chatTitle: chatTitle,
        channelId: channelId,
      },
    });
  };

  return (
    <div className="invite-result">
      <div className="invite-fl-list-container">
        <li className="invite-result-list">
          <div className="ci-user-info">
            <img className="ci-avatar" src={result.avatar_url} alt="프로필" />
            <img className="ci-friend-status" src={`/public/status/${result.status}.svg`} />
            <div className="ci-user-info-text">
              <span className="ci-nickname">{result.nick}</span>
              <span className="ci-title">{setAchievementStr(result.ladder_level)}</span>
              <img className="ci-title-icon" src={setAchievementImg(result.ladder_level)} alt="타이틀로고" />
            </div>
          </div>
          <div className="ci-button-container">
            <span
              className={"ci-invite-btn" + (result.status !== "online" ?
                " ci-deactivated-btn" : "")}
              onClick={result.status === "online" ? () => sendInvite(result.nick) : () => {}}>
              초대하기
            </span>
          </div>
        </li>
      </div>
    </div>
  );
};

/*!
 * @author donglee
 * @brief 친구 목록을 보여주는 FC
 * @param[in] friendList: 친구 객체를 담은 배열
 * @param[in] setDmInfo: 초대하기를 DM으로 보내기 위함
 * @param[in] chatTitle: 초대하기를 할 때 전달할 대화방 이름
 * @param[in] setDmInfo: 초대하기를 할 때 전달할 대화방 channelId
 */

interface FriendListProps {
  friendList: Friend[],
  setDmInfo: Dispatch<SetStateAction<DmInfo>>,
  chatTitle: string,
  channelId: number,
  myInfo: UserInfo,
  chatUsers: ChatUser[],
};

const FriendList: FC<FriendListProps> = (
  {friendList, setDmInfo, chatTitle, channelId, myInfo, chatUsers}): JSX.Element => {

  const setNoticeInfo = useContext(SetNoticeInfoContext);
  /*!
   * @author donglee
   * @brief 대화방 내부에 초대할 사람이 이미 있는지 검사해서 여부를 boolean으로 반환
   */
  const isAlreadyHere = (to: string): boolean => {
    return (chatUsers.some((user) => {
      return user.nick === to;
    }));
  };

  /*!
   * @author donglee
   * @brief 이미 대화방에 있는지 검사 후 DM을 보냄
   */
  const sendInvite = (to: string) => {
    if (isAlreadyHere(to)) {
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: `${to} 님은 이미 대화방에 참여중입니다.`,
        backgroundColor: NOTICE_RED,
      });
      return ;
    }
    setDmInfo({
      isDmOpen: true,
      target: to,
      chatRequest: {
        from: myInfo.nick,
        chatTitle: chatTitle,
        channelId: channelId,
      },
    });
  };

  return (
    <div className="invite-result">
      <div className="invite-fl-header-container">
        <span className="invite-friendList-header">친구 목록</span>
      </div>
      {friendList.length === 0 ?
        <NoResult text="등록된 친구가 없습니다." style={{marginLeft: "75px"}}/>
      :
        <div className="invite-fl-list-container">
          {friendList.map((friend, key) => {
            return (
              <li key={key} className="invite-result-list">
                <div className="ci-user-info">
                  <img className="ci-avatar" src={friend.avatar_url} alt="프로필" />
                  <img className="ci-friend-status" src={`/public/status/${friend.status}.svg`} />
                  <div className="ci-user-info-text">
                    <span className="ci-nickname">{friend.nick}</span>
                    <span className="ci-title">{setAchievementStr(friend.ladder_level)}</span>
                    <img className="ci-title-icon" src={setAchievementImg(friend.ladder_level)} alt="타이틀로고" />
                  </div>
                </div>
                <div className="ci-button-container">
                  <span
                    className={"ci-invite-btn" + (friend.status !== "online" ?
                      " ci-deactivated-btn" : "")}
                    onClick={friend.status === "online" ? () => sendInvite(friend.nick) : () => {}}>
                    초대하기
                  </span>
                </div>
              </li>
            );
          })}
        </div>}
    </div>
  );
}

/*!
 * @author donglee
 * @brief 대화방 내부에서 초대하기를 눌러 검색 후 초대를 보낼 수 있는 컴포넌트
 * @param[in] chatTitle: 초대하기를 할 때 전달할 대화방 이름
 * @param[in] channelId: 초대하기를 할 때 전달할 대화방 channelId
 * @param[in] chatUsers: 초대하기를 할 때 이미 대화방에 존재하는지 여부를 알기 위한 리스트
 */
interface ChatinviteContentProps {
  chatTitle: string,
  channelId: number,
  chatUsers: ChatUser[],
};

const ChatInviteContent: FC<ChatinviteContentProps> = ({chatTitle, channelId, chatUsers}): JSX.Element => {

  const [friendList, setFriendList] = useState<Friend[]>([]);
  const setDmInfo = useContext(SetDmInfoContext);
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<UserInfo>(null);

  const myInfo = useContext(UserInfoContext);
  const setNoticeInfo = useContext(SetNoticeInfoContext);

  const mounted = useRef(false);

  /*!
   * @author donglee
   * @brief 검색하는 search를 통해서 enter나 검색버튼을 클릭할시 API요청을 보냄
   */
  const getUserToFind = async () => {
    if (search === myInfo.nick) {
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: "자기 자신을 초대할 수 없습니다.",
        backgroundColor: NOTICE_RED,
      });
      return ;
    }
    if (!search) return ;

    const easyfetch = new EasyFetch(`${global.BE_HOST}/users?nick=${search}`);
    const res = await easyfetch.fetch();

    if (!res.err_msg) {
      if (mounted.current) setResult(res);
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
   * @brief 초대하기에서 친구들 목록을 처음에 보여주기 위해 API로 받아옴
   */
  const getFriendList = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/friend/list`);
    const res = await easyfetch.fetch();

    if (mounted.current) setFriendList(res.friendList);
  };

  useEffect(() => {
    mounted.current = true;
    getFriendList();
    return (() => {mounted.current = false});
  }, []);

  return (
    <div className="chat-invite-content">
      <div className="invite-header">
        <h2 className="invite-title">대화방 초대하기</h2>
        <div className="invite-input-container">
          <input
            type="text" className="invite-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                getUserToFind();
              } else {
                setResult(null);
              }}}/>
          <img
            className="invite-search-btn"
            src="/public/search.svg"
            alt="검색"
            onClick={getUserToFind}/>
        </div>
      </div>
      {!search && !result && <FriendList
                                friendList={friendList}
                                setDmInfo={setDmInfo}
                                chatTitle={chatTitle}
                                channelId={channelId}
                                myInfo={myInfo}
                                chatUsers={chatUsers} />}
      {result && <Result
                    result={result}
                    setDmInfo={setDmInfo}
                    chatTitle={chatTitle}
                    channelId={channelId}
                    myInfo={myInfo}
                    chatUsers={chatUsers} />}
    </div>
  );
};

export default ChatInviteContent;