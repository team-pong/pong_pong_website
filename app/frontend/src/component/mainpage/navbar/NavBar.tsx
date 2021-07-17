import React, { MouseEvent, SyntheticEvent } from "react";
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

const NavBar = (props: navBarProps): JSX.Element => {
  let targetUser = "";

  const showAddFriend = (e: MouseEvent) => {
    e.stopPropagation();  //icon-plus 클릭시 모달창까지 뜨는 것 방지 
    /*TODO: input화면 보이게 하는 코드 */
    document.getElementById("input-add-friend").style.transform = "scale(1)";
  };

  const addFriend = (e: SyntheticEvent) => {
    e.preventDefault(); //페이지 새로고침 예방
    /* submit button이 있어야될듯 */
  };

  /* LEGACY: 컨텍스트 메뉴를 나중에 활용할 때 쓰일 코드 일단 주석처리 */
  
  // const showFriendContextMenu = (e: MouseEvent, target: string) => {
  //   const contextMenu = document.getElementById("friendcontextmenu");

  //   targetUser = target;
  //   if (contextMenu.style.display === "none" || !contextMenu.style.display) {
  //     contextMenu.style.display = "block";
  //     contextMenu.style.top = e.pageY + "px";
  //     contextMenu.style.left = e.pageX + "px";
  //     document.getElementById("sidemenu").style.overflow = "hidden";
  //   } else {
  //     contextMenu.style.display = "none";
  //     document.getElementById("sidemenu").style.removeProperty("overflow");
  //     targetUser = "";
  //   }
  // };

  // const sendMessage = (e: MouseEvent) => {
  //   console.log("sendMessage", targetUser);
  // };

  // const deleteFriend = (e: MouseEvent) => {
  //   console.log("deleteFriend", targetUser);
  // };

  //semantic tag <nav> 사용함
  //TODO: Users 클릭시 친구 목록이 보여야 함. 테스트용으로 Config 모달 뜨게 해 놓음.
  return (
    <nav className="menu">
      <header className="avatar">
        <img id="avartarImg" src={props.avartarImgUrl} alt="Avatar" />
        <h2>DomHardy</h2>
      </header>
      <ul>
        <li onClick={() => props.setIsConfigOpen(true)}>
          <img src="./public/users.svg"/>
          <span>친구</span>
          <img id="icon-plus" onClick={showAddFriend} src="./public/plus.svg"/>
          <form onSubmit={addFriend}>
            <input id="input-add-friend" type="type" onClick={(e: MouseEvent) => e.stopPropagation()} required placeholder="추가할 닉네임을 입력하세요" />
          </form>
        </li>
        <li onClick={() => props.setIsRecordOpen(true)}>
          <img src="./public/line-graph.svg"/>
          <span>전적</span>
        </li>
        <li onClick={() => props.setIsGameOpen(true)}>
          <img src="./public/controller-play.svg"/>
          <span>게임하기</span>
        </li>
        <li onClick={() => props.setIsConfigOpen(true)}>
          <img src="./public/tools.svg"/>
          <span>설정</span>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
