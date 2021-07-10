import { MouseEvent, useEffect, useState } from "react";
import { ModalController, ConfigContent } from "../../modal/Modal";
import "/src/scss/NavBar.scss";

interface navBarProps {
  avartarImgUrl: string; //우상단 본인 url 이미지
  friends: { name: string; state: string; avatarURL: string }[];
  //avatarURL: 친구들 각각의 아바타이미지
}

const NavBar = (props: navBarProps): JSX.Element => {
  let targetUser = "";

  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const showFriendContextMenu = (e: MouseEvent, target: string) => {
    const contextMenu = document.getElementById("friendcontextmenu");

    targetUser = target;
    if (contextMenu.style.display === "none" || !contextMenu.style.display) {
      contextMenu.style.display = "block";
      contextMenu.style.top = e.pageY + "px";
      contextMenu.style.left = e.pageX + "px";
      document.getElementById("sidemenu").style.overflow = "hidden";
    } else {
      contextMenu.style.display = "none";
      document.getElementById("sidemenu").style.removeProperty("overflow");
      targetUser = "";
    }
  };

  const sendMessage = (e: MouseEvent) => {
    console.log("sendMessage", targetUser);
  };

  const deleteFriend = (e: MouseEvent) => {
    console.log("deleteFriend", targetUser);
  };

  const detectOutsideOfSideMenu = (event: any) => {
    if (
      !document.getElementById("sidemenu").contains(event.target) &&
      !document.getElementById("avartarImg").contains(event.target)
    ) {
      setIsSideMenuOpen(false);
      document.getElementById("friendcontextmenu").style.display = "none";
      targetUser = "";
    }
  };

  useEffect(() => {
    if (isSideMenuOpen) {
      document.getElementById("sidemenu").style.width = "250px";
    } else {
      document.getElementById("friendcontextmenu").style.display = "none";
      document.getElementById("sidemenu").style.width = "0px";
    }
  }, [isSideMenuOpen]);

  useEffect(() => {
    document.addEventListener("mousedown", detectOutsideOfSideMenu);
    return () =>
      document.removeEventListener("mousedown", detectOutsideOfSideMenu);
  }, []);

  //semantic tag <nav> 사용함
  return (
    <nav>
      <div className="navbar">
        <ul>
          <li><a href="">Match Making</a></li>
          <li><a href="">History</a></li>
          <li><a href="">Chat</a></li>
        </ul>
        <img
          src={props.avartarImgUrl}
          id="avartarImg"
          alt="Avatar"
          onClick={() => setIsSideMenuOpen(!isSideMenuOpen)}
        />
      </div>
      <div id="sidemenu">
        <ul id="friendlist">
          {props.friends.map((friend, i: number) => (
            <li
              id={`friend-list-${friend.name}`}
              onClick={(e) => showFriendContextMenu(e, friend.name)}
              key={friend.name}
            >
              <img src={friend.avatarURL} /> {friend.name}/{friend.state}
            </li>
          ))}
        </ul>
        <ul id="friendcontextmenu">
          <li onClick={sendMessage}>메세지보내기</li>
          <li onClick={deleteFriend}>친구삭제</li>
        </ul>
        <img
          src="./public/config.png"
          alt="Config"
          onClick={() => setIsConfigOpen(true)}
        />
        <ModalController
          content={ConfigContent}
          display={isConfigOpen}
          closer={() => setIsConfigOpen(false)}
        />
      </div>
    </nav>
  );
};

export default NavBar;
