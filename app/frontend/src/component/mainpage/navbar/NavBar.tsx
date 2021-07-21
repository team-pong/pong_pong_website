import React, { MouseEvent, SyntheticEvent } from "react";
import { FC, useState } from "react";
import FriendList from "./friendlist/FriendList";
import "/src/scss/NavBar.scss";

/*!
 * @author donglee
 * @brief 좌측에 NavBar가 상시 나타나있음
 *        부모 컴포넌트인 MainPage에서 props로 stateSetter를 받아와서
 *        이 컴포넌트에서 부모컴포넌트의 state를 수정해서 NavBar 요소 선택시
 *        부모 컴포넌트 위에서 모달이 뜨도록 함.
 * @param[in] avartarImgUrl: NavBar에 나타나는 본인의 아바타이미지url
 * @param[in] friends: 테스트용 친구목록 TODO: 모달에서 보여지게 해야 함
 * @param[in] setIsRecordOpen: 클릭시 Record 모달이 오픈되도록 하기 위한 Mainpage.tsx의 stateSetter
 * @param[in] setIsGameOpen: 클릭시 Match-game 모달이 오픈되도록 하기 위한 Mainpage.tsx의 stateSetter
 * @param[in] setIsConfigOpen: 클릭시 Config 모달이 오픈되도록 하기 위한 Mainpage.tsx의 stateSetter
 */

interface navBarProps {
  avartarImgUrl: string;
  friends: { name: string; state: string; avatarURL: string }[];
  setIsRecordOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsGameOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsConfigOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavBar: FC<navBarProps> = (props): JSX.Element => {

  const [isFriendListOpen, setIsFriendListOpen] = useState(false);
  
  const showAddFriend = (e: MouseEvent) => {
    e.stopPropagation();  //icon-plus 클릭시 모달창까지 뜨는 것 방지 
    /*TODO: input화면 보이게 하는 코드 */
    document.getElementById("input-add-friend").style.transform = "scale(1)";
  };

  const addFriend = (e: SyntheticEvent) => {
    e.preventDefault(); //페이지 새로고침 예방
    console.log("submit!");
    /* submit button이 있어야될듯 */
  };

  return (
    <nav className="menu">
      <header className="avatar">
        <img id="avartarImg" src={props.avartarImgUrl} alt="Avatar" />
        <h2>DomHardy</h2>
      </header>
      <ul>
        <li onClick={() => setIsFriendListOpen(!isFriendListOpen)}>
          <img src="./public/users.svg"/>
          <span>친구</span>
          <img id="icon-plus" onClick={showAddFriend} src="./public/plus.svg"/>
          <form onSubmit={addFriend}>
            <input 
              id="input-add-friend"
              type="type"
              onClick={(e: MouseEvent) => e.stopPropagation()}
              required
              placeholder="추가할 닉네임을 입력하세요" />
          </form>
        </li>
        {isFriendListOpen ? <FriendList friends={props.friends}/> : <></>}
        <li onClick={() => props.setIsRecordOpen(true)}><img src="./public/line-graph.svg"/><span>전적</span></li>
        <li onClick={() => props.setIsGameOpen(true)}><img src="./public/controller-play.svg"/><span>게임하기</span></li>
        <li onClick={() => props.setIsConfigOpen(true)}><img src="./public/tools.svg"/><span>설정</span></li>
      </ul>
    </nav>
  );
};

export default NavBar;
