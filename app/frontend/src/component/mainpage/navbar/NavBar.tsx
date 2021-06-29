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
        <ul>
          {props.friends.map((friend, i: number) => <li key={i}><img src={friend.avatarURL} /> {friend.name}/{friend.state}</li>)}
        </ul>
        <img src="./public/config.png" alt="Config" onClick={() => console.log('config')} />
      </div>
    </>
  );
}

export default NavBar;