import { FC, useEffect, useState } from "react";
import { Link, Redirect, Route, RouteComponentProps, withRouter } from "react-router-dom";
import Modal from "../../Modal";
import GameMatchContent from "./GameMatchContent";
import GameRoomContent from "./GameRoomContent";
import GameOptionContent from "./GameOptionContent";
import "/src/scss/content/game/GameContent.scss";

interface isMatched {
  isMatched: boolean;
  roomId: string;
  opponent: string;
  position: string;
  socket: any;
}

const GameContent: FC<RouteComponentProps> = ({match: {path}}): JSX.Element => {

  const [isMatched, setIsMatched] = useState<isMatched>({
    isMatched: false,
    roomId: "",
    opponent: "",
    position: "",
    socket: null
  });

  useEffect(() => {
    return (() => {isMatched.socket?.disconnect()});
  }, []);

  return (
    <div id="game-content">
      <Link
        to={`${path}/match/normal`}
        className="game-content-match-button">
          일반 게임
      </Link>
      <Link
        to={`${path}/match/ladder`}
        className="game-content-match-button">
          레더 게임
      </Link>

      {/* 라우팅 */}
      <Route path={`${path}/match/:matchType`}>
        <Modal id={Date.now()} content={<GameOptionContent />}/>
      </Route>
      <Route path={`${path}/match/:matchType/:map`}>
        <Modal id={Date.now()} smallModal content={<GameMatchContent setIsMatched={setIsMatched}/>}/>
      </Route>
      <Route path={`${path}/game/:roomId`}>
        <Modal id={Date.now()} content={<GameRoomContent socket={isMatched.socket}/>} />
      </Route>

      {/* 매치가 됐을 경우 game room 으로 redirect */}
      {isMatched.isMatched && <Redirect to={`${path}/game/${isMatched.roomId}`} />}
    </div>
  );
}

export default withRouter(GameContent);