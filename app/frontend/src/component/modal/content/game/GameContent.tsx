import { FC } from "react";
import { Link, Route, RouteComponentProps, withRouter } from "react-router-dom";
import Modal from "../../Modal";
import GameMatchContent from "./GameMatchContent";
import "/src/scss/content/game/GameContent.scss";

const GameContent: FC<RouteComponentProps> = ({match: {path, url}}): JSX.Element => {
  return (
    <div id="game-content">
      <Link
        to={`${url}/normal-matching`}
        className="match-buttons">
        일반게임
      </Link>
      <Link
        to={`${url}/ladder-matching`}
        className="match-buttons">
        래더게임
      </Link>

      <Route path={`${path}/:matchType`}>
        <Modal id={Date.now()} smallModal content={<GameMatchContent />}/>
      </Route>
    </div>
  );
}

export default withRouter(GameContent);