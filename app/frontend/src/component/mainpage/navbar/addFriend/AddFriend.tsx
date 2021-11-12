import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { SetNoticeInfoContext } from "../../../../Context";
import EasyFetch from "../../../../utils/EasyFetch";

export const NOTICE_RED = "#CE4D36";
export const NOTICE_GREEN = "#62C375";

/*!
* @author donglee
* @brief "icon-plus" (+ 이미지 로고) 를 클릭했을 때 친구 추가 UI를 보여주는 FC
* @param[in] setState 이 컴포넌트를 보여줄 지 말지를 정하는 상위컴포넌트(NavBar.tsx)의 stateSetter
* @param[in] friendList 친구 추가 시에 state를 업데이트 할 때 사용하기 위해 NavBar에서 오는 state
* @param[in] setFriendList 친구 추가 시에 state를 업데이트 할 때 사용하기 위해 NavBar에서 오는 stateSetter
* @detail ESC키를 받거나, 다른 부분을 클릭하면 컴포넌트를 언마운트함.
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
  
  const setNoticeInfo = useContext(SetNoticeInfoContext);

  /*!
  * @author donglee
  * @brief 추가한 정보를 GET 요청 후 friendList 깊은 복사를 하고 state 업데이트
  *        state 업데이트 시 즉시 변화가 반영됨
  */
  const updateState = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/users?nick=${nicknameToFind}`);
    const res = await easyfetch.fetch();

    if (!res.err_msg) {
      const updatedList = JSON.parse(JSON.stringify(props.friendList));
      updatedList.push(res);
      props.setFriendList(updatedList);
    }
  };

  /*!
  * @author donglee
  * @brief 친구 추가 POST 요청
  */
  const addFriend = async (e: React.SyntheticEvent) => {
    e.preventDefault(); //문서 새로고침을 방지하기 위함

    const easyfetch = new EasyFetch(`${global.BE_HOST}/friend`, "POST");
    const body = {
      "friend_nick": nicknameToFind
    };
    const res = await easyfetch.fetch(body);

    if (res.err_msg !== "에러가 없습니다.") {
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: res.err_msg,
        backgroundColor: NOTICE_RED,
      });
    } else {
      updateState();
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: "친구로 추가했습니다.",
        backgroundColor: NOTICE_GREEN,
      });
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
        maxLength={20}
        required
        placeholder="추가할 닉네임을 입력하세요"
        value={nicknameToFind}
        onChange={(e: React.FormEvent<HTMLInputElement>) => setNicknameToFind(e.currentTarget.value)} />
      <button id="submit-button" onClick={(e: React.MouseEvent<HTMLElement>) => {e.stopPropagation()}}>추가</button>
    </form>
  );
}

export default AddFriend;