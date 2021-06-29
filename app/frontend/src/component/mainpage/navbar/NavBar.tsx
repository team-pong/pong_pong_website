import {MouseEvent, useState} from "react";
import "/src/scss/NavBar.scss";

interface navBarProps {
  avartarImgUrl: string,
  friends: { name: string, state: string, avatarURL: string }[]
}

const NavBar = (props: navBarProps): JSX.Element => {

  let targetUser = "";

  const openSideMenu = () => {
    document.getElementById("sidemenu").style.width = "250px";
  };

  const closeSideMenu = () => {
    document.getElementById("sidemenu").style.width = "0px";
  };

  const controllSideMenu = () => {
    const isOpen: boolean = document.getElementById("sidemenu").style.width === "250px" ? true : false;
    if (!isOpen) openSideMenu();
    else closeSideMenu();
  };

  const showFriendContextMenu = (e: MouseEvent, target: string) => {
    const contextMenu = document.getElementById('friendcontextmenu');
    //왜 쿼리실렉터는 style이 안되는데?
    targetUser = target;
    //마치 state인것처럼 클릭했을 때 그 클릭한 친구의 이름을 가져오기 위함
    if (contextMenu.style.display === 'none' || !contextMenu.style.display) {
      contextMenu.style.display = 'block';
      contextMenu.style.top = e.pageY + 'px';
      contextMenu.style.left = e.pageX + 'px';
    } else {
      contextMenu.style.display = 'none';
      targetUser = "";
    }
  }

  const sendMessage = (e: MouseEvent) => {
    console.log('sendMessage', targetUser);
  }

  const deleteFriend = (e: MouseEvent) => {
    console.log('deleteFriend', targetUser);
  }

  return (
    <>
      <div className="navbar">
        <ul>
          <li><a href="">Match Making</a></li>
          <li><a href="">History</a></li>
          <li><a href="">Chat</a></li>
        </ul>
        <img src={props.avartarImgUrl} alt="Avatar" onClick={controllSideMenu} />
      </div > 
      <div id="sidemenu">
        <ul id="friendlist">
          {props.friends.map((friend, i: number) => (
            <li onClick={(e) => showFriendContextMenu(e, friend.name)} key={i}>
              <img src={friend.avatarURL} /> {friend.name}/{friend.state}
            </li>
          ))}
        </ul>
        <ul id="friendcontextmenu">
          <li onClick={sendMessage}>DM</li>
          <li onClick={deleteFriend}>DELETE</li>
        </ul>
        <img src="./public/config.png" alt="Config" onClick={() => console.log('config')} />
      </div>
    </>
  );
}

export default NavBar;