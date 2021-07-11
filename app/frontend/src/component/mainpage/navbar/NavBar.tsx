import { MouseEvent, useEffect, useState } from "react";
import { Modal, ConfigContent } from "../../modal/Modal";
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

  const sendMessage = (e: MouseEvent) => {
    console.log("sendMessage", targetUser);
  };

  const deleteFriend = (e: MouseEvent) => {
    console.log("deleteFriend", targetUser);
  };

  //semantic tag <nav> 사용함
  return (
    <nav className="menu">
      <header className="avatar">
        <img id="avartarImg" src={props.avartarImgUrl} alt="Avatar" />
        <h2>DomHardy</h2>
      </header>
      <ul>
        <li onClick={() => setIsConfigOpen(true)} className="icon-users"><span>Users</span></li>
        <li onClick={() => setIsConfigOpen(true)} className="icon-record"><span>Record</span></li>
        <li onClick={() => setIsConfigOpen(true)} className="icon-match-game"><span>Match Game</span></li>
        <li onClick={() => setIsConfigOpen(true)} className="icon-settings"><span>Settings</span></li>
      </ul>
      <Modal 
        content={ConfigContent}
        display={isConfigOpen}
        handleClose={() => setIsConfigOpen(false)}/>
    </nav>
  );
};

export default NavBar;
