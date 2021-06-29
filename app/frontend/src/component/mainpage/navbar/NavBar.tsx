import {MouseEvent} from "react";
import "/src/scss/NavBar.scss";

interface navBarProps {
  avartarImgUrl: string,
  friends: { name: string, state: string, avatarURL: string }[]
}

const NavBar = (props: navBarProps): JSX.Element => {

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

  const showFriendContextMenu = (e: MouseEvent) => {
    const contextMenu = document.getElementById('friendcontextmenu');
    //왜 쿼리실렉터는 style이 안되는데?
    
    contextMenu.style.display = 'block';
    contextMenu.style.top = e.pageY + 'px';
    contextMenu.style.left = e.pageX + 'px';
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
            <li onClick={showFriendContextMenu} key={i}>
              <img src={friend.avatarURL} /> {friend.name}/{friend.state}
            </li>
          ))}
        </ul>
        <ul id="friendcontextmenu">
          <li>DM</li>
          <li>DELETE</li>
        </ul>
        <img src="./public/config.png" alt="Config" onClick={() => console.log('config')} />
      </div>
    </>
  );
}

export default NavBar;