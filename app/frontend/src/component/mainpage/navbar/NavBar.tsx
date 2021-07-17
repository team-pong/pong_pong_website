import { MouseEvent, FC, useState } from "react";
import "/src/scss/NavBar.scss";

/*!
 * @author yochoi
 * @brief props 로 x, y 좌표를 받아 해당 위치에 context menu를 띄우는 컴포넌트
 * @param[in] x context menu의 x 좌표
 * @param[in] y context menu의 y 좌표
 */

interface contextMenuProps {
  target: string,
  x: number,
  y: number
}

const ContextMenu: FC<contextMenuProps> = ({target, x, y}): JSX.Element => {
  return (
    <ul id="context-menu" style={{ top: y, left: x, }}>
      <li onClick={() => console.log(`message to ${target}`)}>메세지 보내기</li>
      <li onClick={() => console.log(`delete ${target}`)}>친구 삭제하기</li>
    </ul>
  );
}

/*!
 * @author yochoi
 * @brief friend list 를 div로 감싸 반환하는 FC
 * @param[in] friends friend 객체의 배열
 */

interface friend {
  name: string,
  state: string,
  avatarURL: string
}

interface friendListProps {
  friends: friend[]
}

const FriendList: FC<friendListProps> = (props): JSX.Element => {

  const [contextMenuInfo, setContextMenuInfo] = useState<{isOpen: boolean, target: string, xPos: number, yPos: number}>({
    isOpen: false,
    target: "",
    xPos: 0,
    yPos: 0
  });

  const friendOnClick = (e: MouseEvent, target: string) => {
    setContextMenuInfo({
      isOpen: !contextMenuInfo.isOpen,
      target: target,
      xPos: e.pageX,
      yPos: e.pageY
    });
  }

  const friendListGenerator = (friend: friend, keyIdx: number) => {
    return (
      <div className="friend" key={keyIdx} onClick={(e) => friendOnClick(e, friend.name)}>
        <img src={friend.avatarURL}/>{friend.name}
      </div>
    );
  };

  return (
    <>
      {props.friends.map(friendListGenerator)}
      {contextMenuInfo.isOpen ? <ContextMenu target={contextMenuInfo.target} x={contextMenuInfo.xPos} y={contextMenuInfo.yPos}/> : <></>}
    </>
  );
}

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

  const [isFriendListOpen, setIsFriendListOpen] = useState(false);

  return (
    <nav className="menu">
      <header className="avatar">
        <img id="avartarImg" src={props.avartarImgUrl} alt="Avatar" />
        <h2>DomHardy</h2>
      </header>
      <ul>
        <li onClick={() => setIsFriendListOpen(!isFriendListOpen)} className="icon-users"><img src="./public/users.svg"/><span>친구</span></li>
        {isFriendListOpen ? <FriendList friends={props.friends}/> : <></>}
        <li onClick={() => props.setIsRecordOpen(true)} className="icon-record"><img src="./public/line-graph.svg"/><span>전적</span></li>
        <li onClick={() => props.setIsGameOpen(true)} className="icon-match-game"><img src="./public/controller-play.svg"/><span>게임하기</span></li>
        <li onClick={() => props.setIsConfigOpen(true)} className="icon-settings"><img src="./public/tools.svg"/><span>설정</span></li>
      </ul>
    </nav>
  );
};

export default NavBar;
