import { FC, useEffect, useState } from "react";
import { Link, Redirect, Route, RouteComponentProps, withRouter } from "react-router-dom";
import Modal from "../../Modal";
import GameMatchContent from "./GameMatchContent";
import GameRoomContent from "./GameRoomContent";
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
        to={`${url}/match/normal-matching`}
        className="match-buttons">
        일반게임
      </Link>
      <Link
        to={`${url}/match/ladder-matching`}
        className="match-buttons">
        래더게임
      </Link>

      {/* 매칭 성공시 아래로 리디렉트 */}
      {isMatched.isMatched && <Redirect to={`${url}/game/${isMatched.roomId}`} />}

      <Route path={`${path}/match/:matchType`}>
        <Modal id={Date.now()} smallModal content={<GameMatchContent setIsMatched={setIsMatched}/>}/>
      </Route>
      <Route path={`${path}/game/:roomId`}>
        <Modal id={Date.now()} content={<GameRoomContent matchInfo={isMatched} setIsMatched={setIsMatched}/>}/>
      </Route>
    </div>
  );
}

export default withRouter(GameContent);