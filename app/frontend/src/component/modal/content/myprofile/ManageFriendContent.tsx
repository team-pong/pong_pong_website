import { useEffect, useState } from "react";
import EasyFetch from "../../../../utils/EasyFetch";
import "/src/scss/content/myprofile/ManageFriendContent.scss";

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

	const deleteFriend = (e: React.MouseEvent) => {
		console.log("delete friend");
	};

	const blockFriend = (e: React.MouseEvent) => {
		console.log("block friend");
	};

	const getFriendList = async () => {
		//session id로 쿼리를 만들어야 하는데 session id를 어디서 어떻게 구할 수 있을까?
		// const easyfetch = new EasyFetch(`http://127.0.0.1:3001/users?nick=${nick}`);
		// const res = await (await EasyFetch.fetch()).json();

		//일단 test용 하드코딩
		setFriendList(
			[
				{
					user_id: "jinbkim",
					nick: "jinbkim",
					avatar_url: "https://gravatar.com/avatar/d93441b99017237ec67159e63c4f991?s=400&d=robohash&r=x",
					total_games: 20,
					win_games: 10,
					loss_games: 10,
					ladder_level: 1000,
					status: "on"
				},
				{
  				user_id: "hna",
  				nick: "hna",
  				avatar_url: "https://gravatar.com/avatar/d93441b9901723e7ec6159e63c4f993?s=400&d=robohash&r=x",
  				total_games: 0,
  				win_games: 0,
  				loss_games: 0,
  				ladder_level: 1000,
  				status: "on"
				}
			]
		);
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
									<span className="fl-title">majesty</span>
									<img className="fl-title-icon" src="/public/yellow-crown.png" alt="타이틀로고" />
								</div>
							</div>
							<div className="fl-buttons">
								<img 
									className="fl-delete-friend"
									title="친구 삭제"
									src="/public/trashcan.png"
									alt="친구삭제"
									onClick={deleteFriend} />
								<img
									className="fl-block-friend"
									title="친구 차단"
									src="/public/block.png"
									alt="친구차단"
									onClick={blockFriend} />
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

	const unblockFriend = (e: React.MouseEvent) => {
		console.log("unblock friend");
	};

	const getBlockedList = async () => {
		// const easyfetch = new EasyFetch(`http://127.0.0.1:3001/users?nick=${nick}`);
		// const res =  await (await easyfetch.fetch()).json();
		
		//test 하드코딩
		setBlockedList(
			[
				{
					user_id: "yochoi",
					nick: "yochoi",
					avatar_url: "https://gravatar.com/avatar/d93441b990173e7ec67159e63c4f994?s=400&d=robohash&r=x",
					total_games: 10,
					win_games: 0,
					loss_games: 10,
					ladder_level: 500,
					status: "on"
				}
			]
		)
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
									<span className="fl-title">loser</span>
									<img className="fl-title-icon" src="/public/green-crown.png" alt="타이틀로고" />
								</div>
							</div>
							<div className="fl-buttons">
								<span className="bl-unblock" onClick={unblockFriend}>차단 해제</span>
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