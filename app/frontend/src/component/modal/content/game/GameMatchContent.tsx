import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Loading from "../../../loading/Loading";
import { io } from "socket.io-client";
import "/src/scss/content/game/GameMatchContent.scss";

interface gameMatchContentProps
  extends RouteComponentProps<{matchType: string}> {
  setIsMatched: Dispatch<SetStateAction<{
    isMatched: boolean;
    roomId: string;
    opponent: string;
  }>>;
}

const GameMatchContent: FC<gameMatchContentProps> = ({match: {params}, setIsMatched}): JSX.Element => {

  useEffect(() => {
    const socket = io("http://127.0.0.1:3001/game");
    socket.emit(params.matchType.split('-')[0], {withCredentials: true});
    socket.on("matched", (roomId: string, opponent: string) => {
      setIsMatched({isMatched: true, roomId, opponent});
    });
    return (() => {socket.disconnect();});
  }, []);

  return (
    <div id="game-match-content">
      <Loading width={400} height={300} color="#62C375"/>
      {params.matchType === "normal-match" && "일반 게임 찾는중..."}
      {params.matchType === "ladder-match" && "레더 게임 찾는중..."}
    </div>
  );
}

export default withRouter(GameMatchContent);