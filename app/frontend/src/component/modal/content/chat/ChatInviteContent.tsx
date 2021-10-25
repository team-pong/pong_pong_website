import "../../../../scss/content/chat/ChatInviteContent.scss";
import { Dispatch, FC, SetStateAction, useContext, useEffect, useState } from "react";
import { SetDmInfoContext } from "../../../../Context";
import EasyFetch from "../../../../utils/EasyFetch";
import { setAchievementImg, setAchievementStr } from "../../../../utils/setAchievement";
import { Friend } from "../profile/ManageFriendContent";
import NoResult from "../../../noresult/NoResult";
import { UserInfo } from "../../../mainpage/MainPage";

interface ResultProps {
  result: UserInfo,
  setDmInfo: Dispatch<SetStateAction<{isDmOpen: boolean, target: string}>>,
};

const Result: FC<ResultProps> = ({result, setDmInfo}): JSX.Element => {

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
              onClick={result.status === "online" ?
                () => setDmInfo({isDmOpen: true, target: result.nick})
                : () => {}}>
              초대하기
            </span>
          </div>
        </li>
      </div>
    </div>
  );
};

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
                  <span
                    className={"ci-invite-btn" + (friend.status !== "online" ?
                      " ci-deactivated-btn" : "")}
                    onClick={friend.status === "online" ?
                      () => setDmInfo({isDmOpen: true, target: friend.nick})
                      : () => {}}>
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

const ChatInviteContent: FC = (): JSX.Element => {

  const [friendList, setFriendList] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const setDmInfo = useContext(SetDmInfoContext);
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<UserInfo>(null);

  const getUserToFind = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/users?nick=${search}`);
    const res = await easyfetch.fetch();

    if (!res.err_msg) {
      setResult(res);
    } else {
      alert(res.err_msg);
    }
  };

	const getFriendList = async () => {
		const easyfetch = new EasyFetch(`${global.BE_HOST}/friend/list`);
		const res = await easyfetch.fetch();

		setFriendList(res.friendList);
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
            onKeyDown={(e) => {
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
      {!search && !result && <FriendList friendList={friendList} setDmInfo={setDmInfo} />}
      {result && <Result result={result} setDmInfo={setDmInfo} />}
    </div>
  );
};

export default ChatInviteContent;