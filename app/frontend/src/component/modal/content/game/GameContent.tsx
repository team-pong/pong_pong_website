import { FC, useEffect, useState } from "react";
import { Link, Redirect, Route, RouteComponentProps, useLocation, withRouter } from "react-router-dom";
import Modal from "../../Modal";
import GameRoomContent from "./GameRoomContent";
import GameOptionContent from "./GameOptionContent";
import "/src/scss/content/game/GameContent.scss";

interface isMatched {
  isMatched: boolean;
  roomId: string;
  socket: any;
}

export interface GameInviteType {
  target: string,
  targetAvatar?: string,
  mapId?: string,
}

const GameContent: FC<RouteComponentProps> = ({match: {path, url}}): JSX.Element => {

  const [isMatched, setIsMatched] = useState<isMatched>({
    isMatched: false,
    roomId: "",
    socket: null
  });

  const {state} = useLocation<GameInviteType>();

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
      <Route path={`${path}/match/:matchType`}>
        <Modal id={Date.now()} content={<GameOptionContent setIsMatched={setIsMatched}/>}/>
      </Route>
      <Route path={`${path}/game/:roomId`}>
        <Modal id={Date.now()} content={<GameRoomContent socket={isMatched.socket}/>} />
      </Route>
      {/* 매치가 됐을 경우 game room 으로 redirect */}
      {isMatched.isMatched && <Redirect to={`${path}/game/${isMatched.roomId}`} />}
      {/* 대전신청을 하면 이 컴포넌트로 오자마자 state값이 있으니
       GameOptionContent로 리디렉트 */}
      {state && <Redirect to={{pathname: `${url}/match/normal`, state: state}} />}
    </div>
  );
}

export default withRouter(GameContent);