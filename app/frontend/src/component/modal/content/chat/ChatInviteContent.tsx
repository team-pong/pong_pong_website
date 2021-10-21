import "../../../../scss/content/chat/ChatInviteContent.scss";
import { FC, useContext, useEffect, useState } from "react";
import { SetDmInfoContext } from "../../../../Context";
import EasyFetch from "../../../../utils/EasyFetch";
import { setAchievementImg, setAchievementStr } from "../../../../utils/setAchievement";
import { Friend } from "../profile/ManageFriendContent";

const ChatInviteContent: FC = (): JSX.Element => {

  const [noResult, setNoResult] = useState(false);
  const [friendList, setFriendList] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const setDmInfo = useContext(SetDmInfoContext);
  const [search, setSearch] = useState("");

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
    /* TODO: API를 만들어서 여기서 한 글자 쓸 때마다 결과를 가져와서
             검색내용이랑 부분적으로 일치하는 모든 user를 보여주는 것은 어떤가? */
  };

  useEffect(() => {
    getFriendList();
  }, []);

  return (
    <div className="chat-invite-content">
      <div className="invite-header">
        <h2 className="invite-title">대화방 초대하기</h2>
        <div className="invite-input-container">
          <input type="text" className="invite-input" value={search} onChange={(e) => {setSearch(e.target.value); searchNick();}}/>
          <button className="invite-search-btn">검색</button>
        </div>
      </div>
      <div className="invite-result">
        {friendList.map((friend, key) => {
          return (
						<li key={key} className="invite-result-list">
							<div className="ci-user-info">
								<img className="ci-avatar" src={friend.avatar_url} alt="프로필" />
								<div className="ci-user-info-text">
									<span className="ci-nickname">{friend.nick}</span>
									<span className="ci-title">{setAchievementStr(friend.ladder_level)}</span>
									<img className="ci-title-icon" src={setAchievementImg(friend.ladder_level)} alt="타이틀로고" />
								</div>
							</div>
							<div className="ci-button-container">
								<span className="ci-invite-btn" onClick={() => setDmInfo({isDmOpen: true, target: friend.nick})}>초대</span>
							</div>
						</li>
          );
        })}
      </div>
    </div>
  );
};

export default ChatInviteContent;