import { useEffect, useState } from "react";
import EasyFetch from "../../../../utils/EasyFetch";
import "/src/scss/content/profile/ManageFriendContent.scss";
import { setAchievementStr, setAchievementImg } from "../../../../utils/setAchievement";

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

const FriendList: React.FC = () => {

	const [friendList, setFriendList] = useState<Friend[]>();

	const deleteFriend = (nick: string) => {
		console.log(`${nick} delete`);
	};

	const blockFriend = async (nick: string) => {
		const easyfetch = new EasyFetch("http://127.0.0.1:3001/block", "POST");
		const body = {
			"block_nick": nick,
		};
		const res = await (await easyfetch.fetch(body)).json();
		if (res !== "Success") {
			alert("사용자의 이름이 변경됐을 수 있습니다. 다시 시도하십시오.");
		}
		// getFriendList();
	};

	const getFriendList = async () => {
		const easyfetch = new EasyFetch("http://127.0.0.1:3001/friend/list");
		const res = await (await easyfetch.fetch()).json();

		setFriendList(res.friendList);
	}

	useEffect(() => {
		getFriendList();
	},[]);

	if (friendList) {
		return (
			<ul>
				{friendList.map((friend, key) => {
					return (
						<li key={key}>
							<div className="fl-user-info">
								<img className="fl-avatar" src={friend.avatar_url} alt="프로필" />
								<div>
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
		return ( <h1>Loading...</h1> );
	}
}

const BlockedList: React.FC<{nick: string}> = ({nick}) => {
	
	const [blockedList, setBlockedList] = useState<Friend[]>();

	const unblockFriend = async (nick: string) => {
		const easyfetch = new EasyFetch(`http://127.0.0.1:3001/block?block_nick=${nick}`, "DELETE");
		const res = await (await easyfetch.fetch()).json();
		if (res !== "Success") {
			alert("사용자의 이름이 변경됐을 수 있습니다. 다시 시도하십시오.");
		}
	};

	const getBlockedList = async () => {
		const easyfetch = new EasyFetch("http://127.0.0.1:3001/block");
		const res =  await (await easyfetch.fetch()).json();
		
		setBlockedList(res.blockList);
	};

	useEffect(() => {
		getBlockedList();
	},[]);

	if (blockedList) {
		return (
			<ul>
				{blockedList.map((blocked, key) => {
					return (
						<li key={key}>
							<div className="fl-user-info">
								<img className="fl-avatar" src={blocked.avatar_url} alt="프로필" />
								<div>
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
		return ( <h1>Loading...</h1> );
	}
}

const ManageFriendContent: React.FC<{nick: string}> = ({nick}) => {
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
				{isBlockedSelected && <BlockedList nick={nick}/>}
			</div>
		</div>
  );
}

export default ManageFriendContent;