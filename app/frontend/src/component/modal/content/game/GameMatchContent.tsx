import { FC, useEffect, Dispatch, SetStateAction } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import io from "socket.io-client";

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
  }, []);

  return (
    <div id="game-match-content">
      {`매치메이킹중(${(params as any).matchType})...`}
    </div>
  );
}

export default withRouter(GameMatchContent);