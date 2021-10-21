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

	const getFriendList = async () => {
		const easyfetch = new EasyFetch(`${global.BE_HOST}/friend/list`);
		const res = await easyfetch.fetch();

		if (res.friendList.length === 0) {
			setNoResult(true);
			return ;
		}
		setFriendList(res.friendList);
  }
  
  const inviteDM = () => {

  };

  useEffect(() => {
    getFriendList();
  }, []);
  return (
    <div id="chat-invite-content">
      <div className="invite-header">
        <h2>대화방 초대하기</h2>
        <input type="text"/>
        <button>검색</button>
      </div>
      <div className="invite-list">
        {friendList.map((friend, key) => {
          return (
						<li key={key} className="invite-result-list">
							<div className="fl-user-info">
								<img className="fl-avatar" src={friend.avatar_url} alt="프로필" />
								<div className="fl-user-info-text">
									<span className="fl-nickname">{friend.nick}</span>
									<span className="fl-title">{setAchievementStr(friend.ladder_level)}</span>
									<img className="fl-title-icon" src={setAchievementImg(friend.ladder_level)} alt="타이틀로고" />
								</div>
							</div>
							<div className="fl-buttons">
								<span className="bl-unblock" onClick={() => setDmInfo({isDmOpen: true, target: friend.nick})}>초대</span>
							</div>
						</li>
          );
        })}
      </div>
    </div>
  );
};

export default ChatInviteContent;