import { useEffect, useState } from "react";
import "/src/scss/content/myprofile/ManageFriendContent.scss";

const FriendList: React.FC = () => {

	const deleteFriend = (e: React.MouseEvent) => {
		console.log("delete friend");
		/* 클릭한 요소의 li에 id값이 있어야 되는데; */
		//특정할 수 있는 수단이 있어야 한다.
	};

	const banFriend = (e: React.MouseEvent) => {
		console.log("ban friend");
		
	};

	useEffect(() => {
		/* 로그인한 사람의 친구목록을 API에서 받아온다. */
	},[]);

	return (
		<ul>
			<li>
				<div className="fl-user-info">
					<img className="fl-avatar" src="/public/me.jpg" alt="프로필" />
					<div>
						<span className="fl-nickname">domHardy</span>
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
						className="fl-ban-friend"
						title="친구 차단"
						src="/public/ban.png"
						alt="친구차단"
						onClick={banFriend} />
				</div>
			</li>
		</ul>
	);
}

const BannedList: React.FC = () => {

	const unbanFriend = (e: React.MouseEvent) => {
		console.log("unban friend");
	};

	useEffect(() => {
		/* ban한 친구 리스트를 가져온다 */
	},[]);

	return (
	<ul>
		<li>
			<div className="fl-user-info">
				<img className="fl-avatar" src="https://cdn.intra.42.fr/users/medium_yochoi.png" alt="프로필" />
				<div>
					<span className="fl-nickname">yochoi</span>
					<span className="fl-title">loser</span>
					<img className="fl-title-icon" src="/public/green-crown.png" alt="타이틀로고" />
				</div>
			</div>
			<div className="fl-buttons">
				<span className="bl-unban" onClick={unbanFriend}>차단 해제</span>
			</div>
		</li>
	</ul>
	);
}

const ManageFriendContent: React.FC = () => {
	const [isBannedSelected, setIsBannedSelected] = useState(false);

  return (
  	<div id="manage-friend">
			<div className="selectors">
				<div className="top-bar">
					<span>친구관리</span>
				</div>
				<div className="navigator">
					<div
						className={["selector", !isBannedSelected && "selected"].join(" ")}
						onClick={() => setIsBannedSelected(false)}>
						<label className="list-text">친구 목록</label>
					</div>
					<div 
						className={["selector", isBannedSelected && "selected"].join(" ")}
						onClick={() => setIsBannedSelected(true)}>
						<label className="list-text">차단한 사용자</label>
					</div>
				</div>
			</div>
			<div className="selected-list">
				{!isBannedSelected && <FriendList />}
				{isBannedSelected && <BannedList />}
			</div>
		</div>
  );
}

export default ManageFriendContent;