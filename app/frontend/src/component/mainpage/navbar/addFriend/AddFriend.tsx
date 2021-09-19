import { Dispatch, SetStateAction, useEffect, useState } from "react";
import EasyFetch from "../../../../utils/EasyFetch";

/*!
 * @author donglee
 * @brief "icon-plus" (+ 이미지 로고) 를 클릭했을 때 친구 추가 UI를 보여주는 FC
 * @param[in] setState 이 컴포넌트를 보여줄 지 말지를 정하는 상위컴포넌트(NavBar.tsx)의 stateSetter
 * @param[in] friendList 친구 추가 시에 state를 업데이트 할 때 사용하기 위해 NavBar에서 오는 state
 * @param[in] setFriendList 친구 추가 시에 state를 업데이트 할 때 사용하기 위해 NavBar에서 오는 stateSetter
 * @detail SEC키를 받거나, 다른 부분을 클릭하면 컴포넌트를 언마운트함.
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

interface AddFriendProps {
	setState: React.Dispatch<React.SetStateAction<boolean>>;
	friendList: Friend[];
  setFriendList: Dispatch<SetStateAction<Friend[]>>;
}

const AddFriend: React.FC<AddFriendProps> = (props): JSX.Element => {
	const [nicknameToFind, setNicknameToFind] = useState("");

	/*!
 	 * @author donglee
 	 * @brief 추가한 정보를 GET 요청 후 friendList 깊은 복사를 하고 state 업데이트
	 *				state 업데이트 시 즉시 변화가 반영됨
 	 */
	const updateState = async () => {
		const easyfetch = new EasyFetch(`http://127.0.0.1:3001/users?nick=${nicknameToFind}`);
		const res = await (await easyfetch.fetch()).json();

		if (!res.err_msg) {
			const updatedList = JSON.parse(JSON.stringify(props.friendList));
			updatedList.push(res);
			props.setFriendList(updatedList);
		} else {
			alert("에러! 다시 시도하십시오.");
		}
	};

	/*!
 	 * @author donglee
 	 * @brief 친구 추가 POST 요청
 	 */
  const addFriend = async (e: React.SyntheticEvent) => {
    e.preventDefault(); //문서 새로고침을 방지하기 위함

		const easyfetch = new EasyFetch("http://127.0.0.1:3001/friend", "POST");
		const body = {
			"friend_nick": nicknameToFind
		};
		const res = await (await easyfetch.fetch(body)).json();

		if (res.err_msg !== "에러가 없습니다.") {
			alert(res.err_msg);
		} else {
			updateState();
			props.setState(false);
		}
  };

	/*!
 	* @author donglee
 	* @brief ESC키 누르면 이 컴포넌트 언마운트시킴
 	*/
	const detectESC = (e: KeyboardEvent) => {
		if (e.key === "Escape") {
			props.setState(false);
		}
	};
	
	/*!
 	* @author donglee
 	* @detail "icon-plus" 이미지나, NavBar의 "친구" <li>나
	*					이 컴포넌트가 아닌 부분을 누르면 컴포넌트 언마운트시킴
	*					"icon-plus"를 누르면 어차피 언마운트시키기 때문에.
 	*/
	const detectOutside = (e: any) => {
    if (!document.getElementById("form-add-friend")) return;

    if (!document.getElementById("form-add-friend").contains(e.target) &&
				!document.getElementById("icon-plus").contains(e.target) &&
				!document.getElementById("nav-friend").contains(e.target)) {
			props.setState(false);
		}
  }

	useEffect(() => {
		document.getElementById("input-add-friend").focus();

		addEventListener("keyup", detectESC);
		addEventListener("mousedown", detectOutside);
		return (() => {
			removeEventListener("keyup", detectESC);
			removeEventListener("mousedown", detectOutside);
		});
	}, []);

  return (
    <form id="form-add-friend" onSubmit={addFriend}>
      <input 
				id="input-add-friend"
        type="type"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
				autoComplete="off"
				minLength={2}
				maxLength={10}
        required
        placeholder="추가할 닉네임을 입력하세요"
				value={nicknameToFind}
				onChange={(e: React.FormEvent<HTMLInputElement>) => setNicknameToFind(e.currentTarget.value)} />
			<button id="submit-button" onClick={(e: React.MouseEvent<HTMLElement>) => {e.stopPropagation()}}>추가</button>
    </form>
  );
}
 
export default AddFriend;