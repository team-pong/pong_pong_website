import { useEffect, useState } from "react";
import EasyFetch from "../../../../utils/EasyFetch";

/*!
 * @author donglee
 * @brief "icon-plus" (+ 이미지 로고) 를 클릭했을 때 친구 추가 UI를 보여주는 FC
 * @param[in] setState 이 컴포넌트를 보여줄 지 말지를 정하는 상위컴포넌트(NavBar.tsx)의 stateSetter
 * @detail SEC키를 받거나, 다른 부분을 클릭하면 컴포넌트를 언마운트함.
 */

interface AddFriendProps {
	setState: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddFriend: React.FC<AddFriendProps> = (props): JSX.Element => {
	const [nicknameToFind, setNicknameToFind] = useState("");

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

		if (res.err_msg !== "Success") {
			alert(res.err_msg);
		} else {
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