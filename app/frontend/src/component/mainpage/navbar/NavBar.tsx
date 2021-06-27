import navBarProps from './navBarProps'
import "/src/css/NavBar.css";

const NavBar = (props: navBarProps): JSX.Element => {
  return (
    <ol>
      <li id="avatar"><img src={props.avartarImgUrl}/></li>
    </ol>
  );
}

export default NavBar;