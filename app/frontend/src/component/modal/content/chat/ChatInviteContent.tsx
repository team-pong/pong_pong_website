import "../../../../scss/content/chat/ChatInviteContent.scss";
import { Dispatch, FC, SetStateAction, useContext, useEffect, useState } from "react";
import { SetDmInfoContext } from "../../../../Context";
import EasyFetch from "../../../../utils/EasyFetch";
import { setAchievementImg, setAchievementStr } from "../../../../utils/setAchievement";
import { Friend } from "../profile/ManageFriendContent";
import NoResult from "../../../noresult/NoResult";

interface FriendListProps {
  friendList: Friend[],
  setDmInfo: Dispatch<SetStateAction<{isDmOpen: boolean, target: string}>>,
}

/* TODO: 검색하면 검색결과가 리스트에 결과로 나와야 함 
         초대를 보내면 DM이 켜지면서 자동으로 초대메세지가 가도록 해야 함
         초대 메세지 디자인도 해서 DM도 수정해야 함. */
         
const FriendList: FC<FriendListProps> = ({friendList, setDmInfo}): JSX.Element => {
  
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
                  {friend.status === "online" ? <span className="ci-invite-btn" onClick={() => setDmInfo({isDmOpen: true, target: friend.nick})}>초대하기</span> : <></>}
                </div>
              </li>
            );
          })}
        </div>}
    </div>
  );
}

const ChatInviteContent: FC = (): JSX.Element => {

  const [noResult, setNoResult] = useState(false);
  const [friendList, setFriendList] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const setDmInfo = useContext(SetDmInfoContext);
  const [search, setSearch] = useState("");
  const [userToFind, setUserToFind] = useState("");

	const getFriendList = async () => {
		const easyfetch = new EasyFetch(`${global.BE_HOST}/friend/list`);
		const res = await easyfetch.fetch();

		if (res.friendList.length === 0) {
			setNoResult(true);
			return ;
		}
		setFriendList(res.friendList);
  };
  
  const searchNick = async () => {
    
  };

  useEffect(() => {
    getFriendList();
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
            onKeyDown={(e) => {if (e.key === "Enter") setUserToFind(search)}}/>
          <img className="invite-search-btn" src="/public/search.svg" alt="검색"/>
        </div>
      </div>
      <FriendList friendList={friendList} setDmInfo={setDmInfo}/>
    </div>
  );
};

export default ChatInviteContent;