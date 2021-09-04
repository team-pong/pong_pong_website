import { FC, useEffect, Dispatch, SetStateAction } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import io from "socket.io-client";
import Loading from "../../../loading/Loading";
import "/src/scss/content/game/GameMatchContent.scss";

interface gameMatchContentProps {
  setIsMatched: Dispatch<SetStateAction<{
    isMatched: boolean,
    roomId: string,
    opponent: string
  }>>;
}

const GameMatchContent: FC<gameMatchContentProps & RouteComponentProps> = ({match: {params}, setIsMatched}): JSX.Element => {

  useEffect(() => {
    const socket = io("http://127.0.0.1:3001/game");
    socket.emit((params as any).matchType.split("-")[0]);
    socket.on('matched', (data: {roomId: string, opponent: string}) => {
      setIsMatched({isMatched: true, roomId: data.roomId, opponent: data.opponent});
    });
    return (() => {socket.disconnect();});
  }, []);

  return (
    <div id="game-match-content">
      <Loading width={400} height={300} color="#62C375"/>
      {(params as any).matchType.split("-")[0] === "normal" && <span className="game-searching-message">일반 게임을 찾는중...</span>}
      {(params as any).matchType.split("-")[0] === "ladder" && <span className="game-searching-message">래더 게임을 찾는중...</span>}
    </div>
  );
}

export default withRouter(GameMatchContent);