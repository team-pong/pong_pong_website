import { FC, useEffect, useState } from "react";
import { Link, Route, RouteComponentProps, withRouter } from "react-router-dom";
import Modal from "../../Modal";
import GameMatchContent from "./GameMatchContent";
import "/src/scss/content/game/GameContent.scss";

interface isMatched {
  isMatched: boolean,
  roomId: string,
  opponent: string
}

const GameContent: FC<RouteComponentProps> = ({match: {path, url}}): JSX.Element => {

  const [isMatched, setIsMatched] = useState<isMatched>({
    isMatched: false,
    roomId: "",
    opponent: ""
  });

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
        <Modal id={Date.now()} smallModal content={<GameMatchContent setIsMatched={setIsMatched}/>}/>
      </Route>
    </div>
  );
}

export default withRouter(GameContent);